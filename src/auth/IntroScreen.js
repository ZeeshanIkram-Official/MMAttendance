import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useColorScheme } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
  {
    title: 'Easy way to confirm your attendance',
    text: 'It is a long established fact that a reader will be distracted by the readable content.',
    image: require('../assets/11.png'),
  },
  {
    title: 'Desciplinary in \n Your hand',
    text: 'It is a long established fact that a reader will be distracted by the readable content.',
    image: require('../assets/12.png'),
  },
  {
    title: 'Reduce the Workload of Hr managment',
    text: 'It is a long established fact that a reader will be distracted by the readable content.',
    image: require('../assets/13.png'),
  },
];

const IntroScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderSlide = ({ item }) => (
    <View
      style={[
        styles.slide,
        { backgroundColor: isDark ? '#121212' : '#FFF' }, // background change
      ]}
    >
      <Image source={item.image} style={styles.image} />

      <View style={styles.dotsWrapper}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dotStyle,
              { backgroundColor: isDark ? '#444' : '#EDEADE' }, // inactive dots
              i === activeIndex && {
                backgroundColor: isDark ? '#60a5fa' : '#0B74DE', // active dot
                width: 10,
                height: 10,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.textWrapper}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{item.title}</Text>
        <Text style={[styles.text, { color: isDark ? '#ccc' : '#666' }]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <AppIntroSlider
        ref={sliderRef}
        renderItem={renderSlide}
        data={slides}
        onSlideChange={(index) => setActiveIndex(index)}
        showNextButton={false}
        showDoneButton={false}
        renderPagination={() => null}
      />

      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isDark ? '#1e90ff' : '#0B74DE' }, 
          ]}
          onPress={() => {
            if (activeIndex === slides.length - 1) {
              navigation.replace('Login');
            } else {
              sliderRef.current.goToSlide(activeIndex + 1, true);
            }
          }}
        >
          <Text style={styles.buttonText}>
            {activeIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  dotsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  dotStyle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    width: '70%',
    top: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default IntroScreen;
