#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// Update these with values suitable for your network.

const char *ssid = "vivo 1819";
const char *password = "sanjayk03";
const char *mqtt_server = "broker.mqttdashboard.com";

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];
int value = 0;

// define the GPIO connected with Relays
#define RelayPin1 D0

// define the GPIO pin connected to switches
#define SwitchPin1 D1

// Relay State
// Define integer to remember the toggle state for relays
int toggleState_1 = 0;

// Switch State
int SwitchState_1 = 0;

void setup_wifi(){
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char *topic, byte *payload, unsigned int length){
  Serial.print("\n\nMessage arrived [");
  Serial.print(topic);
  Serial.print("] : ");
  for (int i = 0; i < length; i++){
    Serial.print((char)payload[i]);
  }
  Serial.println();

  // When App button is pushed - switch the state
  if ((char)payload[1] == '1'){
    toggleState_1 = HIGH;
    Serial.print("\nToggleState is ");
    Serial.println(String(toggleState_1));
  }else{
    toggleState_1 = LOW;
    Serial.print("\nToggleState is ");
    Serial.println(String(toggleState_1));
  }
  if (toggleState_1 == HIGH){
    digitalWrite(RelayPin1, LOW);
    Serial.print("RelayPin1 is LOW");
  } else {
    digitalWrite(RelayPin1, HIGH);
    Serial.print("RelayPin1 is HIGH");
  }
}

void reconnect(){
  // Loop until we're reconnected
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str()))
    {
      Serial.println("\nconnected");
      //Once connected, subscribe to the topic.
      client.subscribe("/sanjay");
      // And publish an announcement...
      client.publish("/sanjay", "Connected!");
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup(){
  Serial.begin(115200);
  delay(100);

  pinMode(RelayPin1, OUTPUT);

  pinMode(BUILTIN_LED, OUTPUT);

  pinMode(SwitchPin1, INPUT_PULLUP);

  // During Starting all Relays should TURN OFF
  digitalWrite(RelayPin1, HIGH);

  digitalWrite(BUILTIN_LED, HIGH);

  Serial.begin(115200);

  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void manual_control() {
  // Read the state of switch 1
  int newSwitchState_1 = digitalRead(SwitchPin1); //0 if On
  Serial.print("\ndigitalRead(SwitchPin1) : ");
  Serial.print(newSwitchState_1);
  if ((int)newSwitchState_1 != (int)SwitchState_1) {
    SwitchState_1 = newSwitchState_1;

    // Publish the updated switch state to the MQTT topic
    String message = String('1'+SwitchState_1);
    Serial.print("\nString('1'+SwitchState_1): ");
    Serial.print(String('1'+SwitchState_1));
    // client.publish("/sanjay", message.c_str());
  }
}


void loop(){
  // Read the state of switch 1
  SwitchState_1 = digitalRead(SwitchPin1);

  if (!client.connected())
  {
    reconnect();
  }
  client.loop();

  manual_control(); // Manual Switch Control
  delay(2000);
}
