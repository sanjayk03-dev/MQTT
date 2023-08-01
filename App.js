import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, SafeAreaView, Image} from 'react-native';
import Paho from 'paho-mqtt';

const client = new Paho.Client('broker.mqttdashboard.com', Number(8000), `clientID_${parseInt(Math.random() * 10000)}`);

export default function MQTT() {
  const topic = '/sanjay';
  const [msg, setMsg] = useState('0');

  useEffect(() => {
    client.connect({
      // userName: 'iQube',
      // password: 'iq',
      onSuccess: () => {
        console.log('Connected!');
        client.onMessageArrived = onMessage;
        client.onConnectionLost = onConnectionLost;
        try {
          client.subscribe(topic);
          console.log('\nSubscribed:', topic);
        } catch (err) {
          console.log('\nError Subscribing: ', err);
        }
      },
      onFailure: errorMessage => {
        console.log('Failed to connect: ', errorMessage);
      },
    });
  }, []);

  function onMessage(message) {
    console.log('\n\nReceived Message: ', message.payloadString);
    //console.log("\nMessage: ", message);//{"destinationName": "/sanjay", "duplicate": false, "payloadBytes": [111, 102, 102], "payloadString": "off", "qos": 0, "retained": false, "topic": "/sanjay"}
    if (message.destinationName === topic) {
      // console.log("\nReceived Message: ", message.payloadString);
      setMsg(message.payloadString);
    }
  }

  function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log('\nonConnectionLost:' + responseObject.errorMessage);
    }
  }

  function publishHandler(c) {
    if (msg == '0') {
      var message = new Paho.Message('1');
    } else if (msg == '1') {
      var message = new Paho.Message('0');
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
        <View style={styles.subTitleContainer}>
          <Text style={{color: '#434242', fontSize: 18, fontFamily: 'Roboto-Medium'}}>Smart Switch Controller</Text>
        </View>
        {/* <Text>Topic: {topic}</Text> */}
        <View style={styles.switchContainer}>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => publishHandler(client)}>
            {/* <Image source={require('./assets/lightbulb.png')} style={styles.image} /> */}
            <Image source={require('./assets/power.png')} style={styles.power} />
          </TouchableOpacity>
          <View style={styles.detailContainer}>
            <Text style={styles.light}>Light 1</Text>
            {msg * 1 ? (
              <Text style={{color: '#434', fontSize: 22, paddingTop: 3}}>On</Text>
            ) : (
              <Text style={{color: '#434', fontSize: 22, paddingTop: 3}}>Off</Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF3FA',
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
  subTitleContainer: {
    width: '90%',
    height: '10%',
  },
  power: {
    display: 'flex',
    resizeMode: 'contain',
  },
  light: {
    color: '#000',
    fontFamily: 'Roboto-Medium',
    fontSize: 27,
    paddingTop: 8,
  },
  switchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    height: '80%',
  },
  buttonContainer: {
    elevation: 4,
    backgroundColor: '#E7EEF5',
    width: '43%',
    justifyContent: 'center',
    alignItems: 'center',
    height: '30%',
    borderRadius: 77,
    margin: '3%',
  },
  image: {
    width: '30%',
    height: '85%',
    display: 'flex',
    resizeMode: 'contain',
  },
  detailContainer: {
    // backgroundColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '20%',
    padding: '2%',
  },
});
