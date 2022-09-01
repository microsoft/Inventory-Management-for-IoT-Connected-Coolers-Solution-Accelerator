// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for more information

#include <iostream>
#include <iomanip>
#include <fstream>
#include <Mferror.h>
#include <mfidl.h>
#include <mfreadwrite.h>
#include <mfapi.h>
#include <windows.media.h>
#include <windows.media.core.interop.h>
#include <windows.foundation.h>
#include <windows.Storage.streams.h>
#include <winrt\base.h>
#include <winrt\Windows.Media.Capture.h>
#include <winrt\Windows.Media.Capture.Frames.h>
#include <winrt\Windows.Graphics.Imaging.h>
#include <winrt\Windows.Foundation.h>
#include <winrt\Windows.Devices.Enumeration.h>
#include <winrt\Windows.Media.Devices.h>
#include <winrt\Windows.Media.MediaProperties.h>
#include <winrt\Windows.Networking.Connectivity.h>
#include <winrt\Windows.storage.streams.h>
#include "..\Common\inc\NetworkMediaStreamer.h"
#include "..\Common\inc\RTPMediaStreamer.h"
#include "..\Common\inc\RTSPServerControl.h"
#include <iostream>
#include <fstream>
#include <string>
using namespace winrt;
using namespace Windows;
using namespace Media::Capture;
using namespace Frames;
using namespace Windows::Graphics::Imaging;
using namespace Windows::Foundation;
using namespace Windows::Devices::Enumeration;
using namespace Windows::Media;
using namespace Windows::Media::Devices;
using namespace Windows::Media::MediaProperties;
uint16_t ServerPort = 8554;

std::wstring nv12{ L"NV12" };
std::wstring mjpg{ L"MJPG" };

#define DISABLE_SECURE_RTSP

// Uncomment the following if you want to use FrameReader API instead of the Record-to-sink APIs
// Using FrameReader API allows the app to handle/process/modify the sample before streaming out.
// Using Mediacapture Record-to-Sink APIs takes the per sample handling burden away from the App
//#define USE_FR 

std::map<winrt::hstring, std::vector<GUID>> streamMap =
{
    {L"/Camera1", {MFVideoFormat_H264} },
    {L"/Camera2", {MFVideoFormat_H264} } //,
    // NOTE: Uncomment these lines / add more to enable additional cameras
    //{L"/Camera3", {MFVideoFormat_H264} },
    //{L"/Camera4", {MFVideoFormat_H264} }
};

VideoEncodingProperties SetMediaFormat(MediaCapture& mc, int width, int height, int type)
{
    auto formats = mc.VideoDeviceController().GetAvailableMediaStreamProperties(MediaStreamType::VideoRecord);
    IMediaEncodingProperties selectedProp(nullptr);
    uint32_t idx = 1;


    for (auto f : formats)
    {
        auto format = f.try_as<VideoEncodingProperties>();
        float fr = (float)format.FrameRate().Numerator() / (float)format.FrameRate().Denominator();
        //std::wcout << L"\n" << idx++ << L". Format being used: " << format.Width() << L"x" << format.Height() << L"@" << fr << L":" << format.Subtype().c_str();
        if (format.Width() == width && format.Height() == height && ((type == 0 && format.Subtype().c_str() == nv12) || (type == 1 && format.Subtype().c_str() == mjpg))) {
            std::wcout << L"\n" << idx++ << L". Format being used: " << format.Width() << L"x" << format.Height() << L"@" << fr << L":" << format.Subtype().c_str();
            return format.try_as<VideoEncodingProperties>();
        }
    }
    return formats.GetAt(0).try_as<VideoEncodingProperties>();
}


int main(int argc, char* argv[])
{
    bool calibrationMode = false;
    bool configFileOption = false;
    int height = 720;
    int width = 1280;
    int type = 0; // 0 is NV12 - 1 is MJPG
    std::cout << "********************************\n";
    std::cout << "******* VideoSteamer App *******\n";
    std::cout << "********************************\n";


    if (argc == 5) {
        std::cout << "Config File Path: " << argv[1] << "\n";
        std::cout << "Heigh: " << argv[2] << "\n";
        std::cout << "Width: " << argv[3] << "\n";
        std::cout << "Type: " << argv[4] << "\n";

        width = atoi(argv[2]);
        height = atoi(argv[3]);
        type = atoi(argv[4]);
        configFileOption = true;
    }
    else if (argc == 3) {
        std::cout << "Config File Path: " << argv[1] << "\n";
        std::cout << "Calibration Mode: " << argv[2] << "\n";

        calibrationMode = atoi(argv[2]);
        configFileOption = true;
    } 
    else if (argc == 2) {
        std::cout << "Config File Path: " << argv[1] << "\n";
        configFileOption = true;
    }
    else {
        std::cout << "Parameters missing" << "\n";
    }

    try
    {
        std::wofstream fileLogger("RTSPServer.log");
        fileLogger << L"StartLogging..\n";
        
        std::map<winrt::hstring, std::vector<GUID>> streamMap =
        {
            {L"/Camera1", {MFVideoFormat_H264} },
            {L"/Camera2", {MFVideoFormat_H264} } //,
            // NOTE: Uncomment these lines / add more to enable additional cameras,
            // {L"/Camera3", {MFVideoFormat_H264} },
            // {L"/Camera4", {MFVideoFormat_H264} }
        };

        std::string line;
      
        std::vector<winrt::hstring> symlinks;

        if (configFileOption && !calibrationMode) {
            std::ifstream configFile(argv[1]);
            if (configFile.is_open())
            {
                while (getline(configFile, line))
                {
                    symlinks.push_back(winrt::to_hstring(line));
                }
                configFile.close();
            }
            else
            {
                std::wcout << L"\nUnable to open configuration file.";
                auto filteredDevices = DeviceInformation::FindAllAsync(DeviceClass::VideoCapture).get();
                for (auto&& d : filteredDevices)
                {
                    symlinks.push_back(d.Id());
                }
            }
        }
        else {
            std::wcout << L"\nUnable to open configuration file.";
            auto filteredDevices = DeviceInformation::FindAllAsync(DeviceClass::VideoCapture).get();
            for (auto&& d : filteredDevices)
            {
                symlinks.push_back(d.Id());
            }
        }
   

        // Create a map <hstring, MeidaCapture>
        // Push the mc to the map am
        std::map<winrt::hstring,MediaCapture> mcVec;

        int idx = 0;
        VideoEncodingProperties selectedFormat;

        for (auto&& strm : streamMap)
        {
            auto mc = MediaCapture();

            mc.Failed([](MediaCapture sender, MediaCaptureFailedEventArgs args)
                {
                    std::wcout << L"MediaCapture pipeline error: " << args.Code() << L":" << args.Message().c_str();
                    std::wcout << L"\nPress 0 to exit program.";
                });

            auto s = MediaCaptureInitializationSettings();
            s.VideoDeviceId(symlinks[idx++]);
            s.MemoryPreference(MediaCaptureMemoryPreference::Auto); 
            s.StreamingCaptureMode(StreamingCaptureMode::Video);
            mc.InitializeAsync(s).get();
            selectedFormat = SetMediaFormat(mc, width, height, type);
            mc.VideoDeviceController().SetMediaStreamPropertiesAsync(MediaStreamType::VideoRecord, selectedFormat).get();
            
            if (calibrationMode)
            {
                std::wcout << L"\n" << mc.MediaCaptureSettings().VideoDeviceId().c_str() << ":cameraTest_" << idx << ".jpeg";
                winrt::Windows::Storage::StorageFolder folder = Windows::Storage::KnownFolders::GetFolderForUserAsync(nullptr, Windows::Storage::KnownFolderId::CameraRoll).get();

                wchar_t nameFile[16];
                wsprintf(nameFile, L"cameraTest_%d.jpeg", idx);

                mc.CapturePhotoToStorageFileAsync(ImageEncodingProperties::CreateJpeg(), folder.CreateFileAsync(nameFile, Windows::Storage::CreationCollisionOption::GenerateUniqueName).get());
            }

            mcVec.insert({strm.first, mc});
        }

        auto streamers = winrt::RTSPSuffixSinkMap();
        BitmapSize sz;

        sz.Height = selectedFormat.Height();
        sz.Width = selectedFormat.Width();
        MediaRatio frameRate = selectedFormat.FrameRate();
        std::vector<IMFMediaType*> mediaTypes;
        winrt::com_ptr<IMFMediaType> spOutType;
        winrt::check_hresult(MFCreateMediaType(spOutType.put()));
        winrt::check_hresult(spOutType->SetGUID(MF_MT_MAJOR_TYPE, MFMediaType_Video));
        winrt::check_hresult(spOutType->SetGUID(MF_MT_SUBTYPE, MFVideoFormat_H264));
        winrt::check_hresult(spOutType->SetUINT32(MF_MT_AVG_BITRATE, sz.Width * 1000));
        winrt::check_hresult(spOutType->SetUINT32(MF_MT_INTERLACE_MODE, MFVideoInterlace_Progressive));
        winrt::check_hresult(MFSetAttributeSize(spOutType.get(), MF_MT_FRAME_SIZE, sz.Width, sz.Height));
        winrt::check_hresult(MFSetAttributeRatio(spOutType.get(), MF_MT_FRAME_RATE, frameRate.Numerator() * 100, frameRate.Denominator() * 100));
        mediaTypes.push_back(spOutType.get());
        for (auto&& strm : streamMap)
        {
            IMediaExtension mediaExtSink;
            winrt::check_hresult(CreateRTPMediaSink(mediaTypes.data(), (DWORD)mediaTypes.size(), (IMFMediaSink**)put_abi(mediaExtSink)));
            streamers.Insert(winrt::hstring(strm.first), mediaExtSink);
        }

        com_ptr<IRTSPServerControl> serverHandle, serverHandleSecure;
        com_ptr<IRTSPAuthProvider> m_spAuthProvider;
        check_hresult(GetAuthProviderInstance(AuthType::Digest, L"RTSPServer", m_spAuthProvider.put()));

        // add a default user for testing
        m_spAuthProvider.as<IRTSPAuthProviderCredStore>()->AddUser(L"eflow", L"ConnectedCoolerSA!!");
        check_hresult(CreateRTSPServer(streamers.as<ABI::RTSPSuffixSinkMap>().get(), ServerPort, false, m_spAuthProvider.get(), {}, 0, serverHandle.put()));

        auto loggerdelegate = winrt::LogHandler([&fileLogger](auto er, auto msg)
            {
                fileLogger << msg.c_str() << "\n";
                if (er)
                {
                    fileLogger << L" ErrCode:" << std::hex << er << "\n" << std::dec;
                    std::wcout << msg.c_str();
                    std::wcout << L" ErrCode:" << std::hex << er << "\n" << std::dec;
                }
                fileLogger.flush();

            });
        for (int i = 0; i < (int)LoggerType::LOGGER_MAX; i++)
        {
            EventRegistrationToken t1, t2;
            winrt::check_hresult(serverHandle->AddLogHandler((LoggerType)i, loggerdelegate.as<ABI::LogHandler>().get(), &t1));
            serverHandleSecure ? winrt::check_hresult(serverHandleSecure->AddLogHandler((LoggerType)i, loggerdelegate.as<ABI::LogHandler>().get(), &t2)) : void(0);
        }
        winrt::check_hresult(serverHandle->StartServer());
        serverHandleSecure ? winrt::check_hresult(serverHandleSecure->StartServer()) : void(0);

        std::vector<LowLagMediaRecording> vecLogLag;
        //auto strm = streamers.First();
        
        //add error checking in the loop
        for (auto&& mc : mcVec)
        {
            auto me = MediaEncodingProfile::CreateMp4(VideoEncodingQuality::Auto);
            
            auto lowLagRec = mc.second.PrepareLowLagRecordToCustomSinkAsync(me,streamers.Lookup(mc.first).as<IMediaExtension>()).get();
            lowLagRec.StartAsync().get();
            vecLogLag.push_back(lowLagRec);
            //strm.MoveNext();
        }
        std::cout << "\nStarted Capture and RTSP Server.\n";
        auto hostnames = winrt::Windows::Networking::Connectivity::NetworkInformation::GetHostNames();
        std::cout << "\nAvailable links:\n";
        for (auto&& hname : hostnames)
        {
            for (auto&& s : streamMap)
            {
                std::wcout << L"rtsp://" << hname.DisplayName().c_str() << L":" << ServerPort << s.first.c_str() << std::endl;
            }
        }

        char c = 1;
        while (c != 0)
        {
            std::cout << "\n 0. Quit\n Your choice:";

            std::cin >> c;
            switch (c)
            {
            case '0':
                c = 0;
                break;
            default:
                break;
            }

        }

        for (auto &&lowLagRec : vecLogLag)
        {
            if (lowLagRec)
            {
                lowLagRec.StopAsync().get();
                lowLagRec.FinishAsync().get();
            }
        }

        check_hresult(m_spAuthProvider.as<IRTSPAuthProviderCredStore>()->RemoveUser(L"user"));

    }
    catch (hresult_error const& ex)
    {
        std::wcout << L"Error: " << ex.code() << L":" << ex.message().c_str();
    }
}


