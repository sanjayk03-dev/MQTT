import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Image } from 'react-native';
import Paho from 'paho-mqtt';

const client = new Paho.Client(
  "broker.mqttdashboard.com",
  Number(8000),
  `clientID_${parseInt(Math.random() * 10000)}`
);

export default function MQTT() {

  const topic = "/sanjay";
  const [msg, setMsg] = useState({ '1': '1', '2': '2' });

  useEffect(() => {
    client.connect({
      // userName: 'iQube',
      // password: 'iq',
      onSuccess: () => {
        console.log("Connected!");
        client.onMessageArrived = onMessage;
        client.onConnectionLost = onConnectionLost;
        try {
          client.subscribe(topic);
          console.log('\nSubscribed:', topic);
        } catch (err) {
          console.log("\nError Subscribing: ", err);
        }
      },
      onFailure: (errorMessage) => {
        console.log("Failed to connect: ", errorMessage);
      }
    });
  }, []);

  function onMessage(message) {
    //console.log("\nMessage: ", message);//{"destinationName": "/sanjay", "duplicate": false, "payloadBytes": [111, 102, 102], "payloadString": "off", "qos": 0, "retained": false, "topic": "/sanjay"}
    if (message.destinationName === topic) {
      // console.log("\nReceived Message: ", message.payloadString);
      setMsg(prevMsg => {
        const newMsg = { ...prevMsg };
        if (message.payloadString[0] === '1') {
          newMsg['1'] = message.payloadString;
        } else if (message.payloadString[0] === '2') {
          newMsg['2'] = message.payloadString;
        }
        return newMsg;
      });
    }
  }

  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("\nonConnectionLost:" + responseObject.errorMessage);
    }
  }

  function publishHandler(c, n) {
    if (n == '1') {
      if (msg[1] === '1On') {
        var message = new Paho.Message('1Off');//{"destinationName": "/sanjay", "duplicate": false, "payloadBytes": [72, 101, 108, 108, 111, 111, 111, 111], "payloadString": "Helloooo", "qos": 0, "retained": false, "topic": "/sanjay"}
      } else {
        var message = new Paho.Message('1On');
      }
    } else {
      if (msg[2] === '2On') {
        var message = new Paho.Message('2Off');//{"destinationName": "/sanjay", "duplicate": false, "payloadBytes": [72, 101, 108, 108, 111, 111, 111, 111], "payloadString": "Helloooo", "qos": 0, "retained": false, "topic": "/sanjay"}
      } else {
        var message = new Paho.Message('2On');
      }
    }

    // console.log('Publish Message: ', message);
    message.destinationName = topic;
    c.send(message);
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.TitleContainer}>
        <Text style={styles.TitleText}>Welcome</Text>
      </View>
      <View style={styles.bodyContainer}>
        <View style={styles.item1}>
          <Text style={{ color: '#434242', fontSize: 18, fontFamily: 'Roboto-Medium' }}>Smart Switch Controller</Text>
        </View>
        <Text >Topic: {topic}</Text>
        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => publishHandler(client, '1')}
          >
            <View style={styles.imgcontainer}>
              <Image source={require('./assets/lightbulb.png')} style={styles.image} />
              <Image source={require('./assets/power.png')} style={styles.power} />
            </View>
            <Text style={styles.light}>Light 1</Text>
            <Text style={{ color: '#434', fontSize: 13, paddingTop: 3 }}>{msg[1].slice(1)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => publishHandler(client, '2')}
          >
            <View style={styles.imgcontainer}>
              <Image source={require('./assets/lightbulb.png')} style={styles.image} />
              <Image source={require('./assets/power.png')} style={styles.power} />
            </View>
            <Text style={styles.light}>Light 2</Text>
            <Text style={{ color: '#434', fontSize: 13, paddingTop: 3 }}>{msg[2].slice(1)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF3FA'
  },
  TitleContainer: {
    width: '90%',
    height: '7%',
    justifyContent: 'center',
    //borderRadius: 35,
  },
  TitleText: {
    fontFamily: 'Roboto-Bold',
    color: '#000',
    fontSize: 29,
  },
  bodyContainer: {
    height: '85%',
    width: '100%',
    alignItems: 'center',
  },
  item1: {
    width: '90%',
    height: '10%',
  },
  imgcontainer: {
    flexDirection: 'row',
    width: '100%',
    height: '40%',
    justifyContent: 'space-between',
  },
  power: {
    width: '20%',
    height: '90%',
    display: 'flex',
    resizeMode: 'contain'
  },
  light: {
    color: '#000',
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    paddingTop: 8
  },
  switchContainer: {
    flexDirection: 'row',
    width: '95%',
    height: '80%',
  },
  buttonContainer: {
    backgroundColor: '#E7EEF5',
    width: '44%',
    height: '25%',
    borderRadius: 25,
    padding: '4%',
    margin: '3%'
  },
  image: {
    width: '30%',
    height: '85%',
    display: 'flex',
    resizeMode: 'contain'
  },
})