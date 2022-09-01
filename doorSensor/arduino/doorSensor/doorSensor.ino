#define DoorSensorPin 6
bool bDoorIsOpen = false;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  pinMode(DoorSensorPin, INPUT_PULLUP);

}

void loop() {
   // put your main code here, to run repeatedly:
  if(digitalRead(DoorSensorPin) == 1)
  {
    //door open
    Serial.write("1");
    bDoorIsOpen = true;
    delay(100);
  }
  else
  {
    //door closed
    if(bDoorIsOpen) Serial.write("2");
    bDoorIsOpen = false;
  }

  delay(20); //debouncing pin
}
