// Copyright (c) Microsoft Corporation. All rights reserved
// Licensed under the MIT license. See LICENSE file in the project root for more information
namespace sensorTrigger
{
    using System;
    using Newtonsoft.Json;

    class MessageBody
    {
        [JsonProperty(PropertyName = "doorOpen")]
        public bool DoorOpen { get; set; }

        [JsonProperty(PropertyName = "timeCreated")]
        public DateTime TimeCreated { get; set; }
    }
}
