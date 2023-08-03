#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char *ssid = "Vivo V15";
const char *password = "sanjayk03";
const char *mqtt_server = "broker.mqttdashboard.com";

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];
int value = 0;

//Define relay pins
const int RelayPin1 = D3;
//Define switch pins
const int SwitchPin1 = D5;
//Define Switches State
bool SwitchState_1;
//Define state of relays
int toggleState_1 = 0;

bool connectionState = false;

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - startTime) < 10000) {
    delay(500);
    Serial.print(".");
    digitalWrite(BUILTIN_LED, !digitalRead(BUILTIN_LED));
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
    digitalWrite(BUILTIN_LED, LOW);
  } else {
    Serial.println("");
    Serial.println("WiFi connection failed. Check your credentials or signal.");
    digitalWrite(BUILTIN_LED, LOW);
    delay(1000);
    digitalWrite(BUILTIN_LED, HIGH);
    delay(3000);
    digitalWrite(BUILTIN_LED, LOW);
    delay(3000);
    digitalWrite(BUILTIN_LED, HIGH);
    delay(3000);
    digitalWrite(BUILTIN_LED, LOW);
  }
}

void reconnect() {
  unsigned long startTime = millis();
  // Loop until we're reconnected
  while (!client.connected() && (millis() - startTime) < 10000) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("\nconnected");
      connectionState = true;
      digitalWrite(BUILTIN_LED, HIGH);
      // Once connected, subscribe to the topic.
      client.subscribe("/sanjay");
      // And publish an announcement...
      client.publish("/sanjay", String(toggleState_1).c_str());
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void callback(char *topic, byte *payload, unsigned int length) {
  Serial.print("\n\nMessage arrived [");
  Serial.print(topic);
  Serial.print("] : ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  if (payload[0] == '1') {
    toggleState_1 = 1;
    relayOnOff(1);
  } else if (payload[0] == '0') {
    toggleState_1 = 0;
    relayOnOff(1);
  }
}

void relayOnOff(int relay) {

  switch (relay) {
    case 1:
      if (toggleState_1 == 1) {
        digitalWrite(RelayPin1, LOW);  // turn on relay 1
        Serial.println("Device1 ON");
      } else {
        digitalWrite(RelayPin1, HIGH);  // turn off relay 1
        Serial.println("Device1 OFF");
      }
      delay(100);
      break;
    default:
      break;
  }
}

void with_internet() {
  // Serial.print("\nwith internet");
  if (SwitchState_1 != digitalRead(SwitchPin1)) {
    SwitchState_1 = digitalRead(SwitchPin1);
    toggleState_1 = !toggleState_1;
    client.publish("/sanjay", String(toggleState_1).c_str());
    relayOnOff(1);
  }
}
void without_internet() {
  // Serial.print("Without internet");
  if (SwitchState_1 != digitalRead(SwitchPin1)) {
    SwitchState_1 = digitalRead(SwitchPin1);
    toggleState_1 = !toggleState_1;
    relayOnOff(1);
  }
}

void setup() {
  Serial.begin(9600);
  pinMode(RelayPin1, OUTPUT);
  pinMode(BUILTIN_LED, OUTPUT);
  pinMode(SwitchPin1, INPUT_PULLUP);
  digitalWrite(RelayPin1, LOW);
  SwitchState_1 = digitalRead(SwitchPin1);
  digitalWrite(BUILTIN_LED, LOW);
  setup_wifi();
  // digitalWrite(RelayPin1, HIGH);
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi Not Connected");
    connectionState = false;
    // setup_wifi();
    digitalWrite(BUILTIN_LED, LOW);
    without_internet();
    delay(500);
  } else {
    Serial.println("\nWiFi Connected");
    if (!client.connected()) {
      reconnect();
    }
    client.loop();
    with_internet();
    delay(500);
  }
}