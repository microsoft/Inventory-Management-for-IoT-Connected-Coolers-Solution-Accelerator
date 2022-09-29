// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
namespace sensorTrigger
{
    using System;
    using System.Collections;
    using System.Collections.Generic;
    using System.IO;
    using System.Runtime.InteropServices;
    using System.Runtime.Loader;
    using System.Security.Cryptography.X509Certificates;
    using System.Text;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Azure.Devices.Client;
    using Microsoft.Azure.Devices.Client.Transport.Mqtt;
    using Newtonsoft.Json;
    using System.Net;
    using System.Net.Sockets;

    class Program
    {
        private static IPAddress ipAdress = IPAddress.Parse("192.168.0.126");
        private static IPEndPoint ipEndpoint = new IPEndPoint(ipAdress, 5003);
        private static Byte[] dataACK = Encoding.ASCII.GetBytes("ACK");
         private const string IotEdgedIpAddressVariableName = "IP_ADDRESS";
         private const string IotEdgedPortVariableName = "TCP_PORT";

        static void Main(string[] args)
        {
            Init().Wait();

            // Wait until the app unloads or is cancelled
            var cts = new CancellationTokenSource();
            AssemblyLoadContext.Default.Unloading += (ctx) => cts.Cancel();
            Console.CancelKeyPress += (sender, cpe) => cts.Cancel();
            WhenCancelled(cts.Token).Wait();
        }

        /// <summary>
        /// Handles cleanup operations when app is cancelled or unloads
        /// </summary>
        public static Task WhenCancelled(CancellationToken cancellationToken)
        {
            var tcs = new TaskCompletionSource<bool>();
            cancellationToken.Register(s => ((TaskCompletionSource<bool>)s).SetResult(true), tcs);
            return tcs.Task;
        }

        /// <summary>
        /// Initializes the ModuleClient and sets up the callback to receive
        /// messages containing temperature information
        /// </summary>
        static async Task Init()
        {
            MqttTransportSettings mqttSetting = new MqttTransportSettings(TransportType.Mqtt_Tcp_Only);
            ITransportSettings[] settings = { mqttSetting };

            // Open a connection to the Edge runtime
            ModuleClient ioTHubModuleClient = await ModuleClient.CreateFromEnvironmentAsync(settings);
            await ioTHubModuleClient.OpenAsync();
            Console.WriteLine("IoT Hub module client initialized.");

            // Get environment configurations
            IDictionary envVariables = Environment.GetEnvironmentVariables();
            string ipAdress_str = GetValueFromEnvironment(envVariables, IotEdgedIpAddressVariableName) ?? throw new InvalidOperationException($"Environment variable {IotEdgedIpAddressVariableName} is required.");
            string tcpPort_str = GetValueFromEnvironment(envVariables, IotEdgedPortVariableName) ?? throw new InvalidOperationException($"Environment variable {IotEdgedPortVariableName} is required.");

            // Assign the IP Address based on config
            if(!String.IsNullOrEmpty(ipAdress_str)){
                Console.WriteLine("Configuration received - IP Address: {0}", ipAdress_str);
                ipAdress = IPAddress.Parse(ipAdress_str);
            }   

            // Assign the TCP Port based on config
            if(!String.IsNullOrEmpty(tcpPort_str)){
                Console.WriteLine("Configuration received - TCP Port: {0}", tcpPort_str);
                int portNumber;
                bool success = int.TryParse(tcpPort_str, out portNumber);
                if(success)
                    ipEndpoint = new IPEndPoint(ipAdress, portNumber);
                else
                    throw new InvalidOperationException($"Environment variable {IotEdgedPortVariableName} is not Integer.");
            }
               
            await GetGPIOEvents(ioTHubModuleClient);
        }
    

         /// <summary>
        /// Module behavior:
        /// Checks if the door is open - If open will sned the event
        /// After seding, will wait for 1s
        /// </summary>
        static async Task GetGPIOEvents(ModuleClient moduleClient)
        {
            byte[] data = new byte[3];
            EstablishConnection:
                Socket client = new Socket(ipAdress.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
                client.ReceiveTimeout = 30000;
            try
            {
                // If it's not connected, loop until connection
                while (!client.Connected)
                {
                    try
                    {
                        Console.WriteLine("Attempting to connect to {0}:{1} ...", ipAdress.ToString(), ipEndpoint.Port.ToString());
                        client.Connect(ipEndpoint);
                        Console.WriteLine("Connection established to {0}:{1}", client.RemoteEndPoint.ToString(), ipEndpoint.Port.ToString());
                    }
                    catch (Exception)
                    {
                        // If connection failed - Try again in 30s
                        Console.WriteLine("Failed to connect to {0}:{1} - Retying in 30s", ipAdress.ToString(), ipEndpoint.Port.ToString());
                        System.Threading.Thread.Sleep(30000);
                    }
                }

                // If it's connected, try to get the incoming message
                while (client.Connected)
                {
                    try
                    {
                         int m = client.Receive(data);

                        // If door is open 
                        if (data[0] == 6)
                            await SendEvent(moduleClient, true);
                        
                        // If foor is closed
                        else if (data[0] == 24 )
                            await SendEvent(moduleClient, false);

                        client.Send(dataACK);
                    }
                   catch (Exception)
                    {
                        if (client.Connected)
                        {
                            Console.WriteLine("Read timeout");
                            client.Send(dataACK);
                        } 
                        else
                        {
                            client.Shutdown(SocketShutdown.Both);
                            client.Close();
                            goto EstablishConnection;
                        }
                    }
                }

                client.Shutdown(SocketShutdown.Both);
                client.Close();

            }
            catch (Exception e)
            {
                client.Shutdown(SocketShutdown.Both);
                client.Close();
                Console.WriteLine(e.ToString());
                Console.WriteLine("Transmission end.");
            }
        }


        /// <summary>
        /// Module behavior:
        /// Checks if the door is open - If open will sned the event
        /// </summary>
        static async Task SendEvent(ModuleClient moduleClient, bool doorIsOpen)
        {
            var tempData = new MessageBody
            {
                DoorOpen =  doorIsOpen,
                TimeCreated = DateTime.UtcNow
            };

            string dataBuffer = JsonConvert.SerializeObject(tempData);
            var eventMessage = new Message(Encoding.UTF8.GetBytes(dataBuffer));
            Console.WriteLine($"{DateTime.Now.ToLocalTime()}> Sending message - Body: [{dataBuffer}]");
            await moduleClient.SendEventAsync("eventOpen", eventMessage);
        }


        private static string GetValueFromEnvironment(IDictionary envVariables, string variableName)
        {
            return envVariables.Contains(variableName)
                ? envVariables[variableName].ToString()
                : null;
        }

    }
}
