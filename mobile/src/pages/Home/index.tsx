import React, { useState, useEffect , ChangeEvent } from 'react'
import { Feather as Icon } from '@expo/vector-icons'
import { StyleSheet, Platform, View, ImageBackground, Image, Text } from 'react-native'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios'

interface IBGDEUFResponse {
  sigla: string;
}
interface IBGDECityResponse {
  nome: string;
}

const Home = () => {
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedUf, setSelectedUf] = useState<string>('0')
  const [selectedCity, setSelectedCity] = useState<string>('0')

  const navigation = useNavigation()

  function handleNavigateToPoints() {
    navigation.navigate('Points', { uf: selectedUf, city: selectedCity })
  }
  function handleSelectedUf(val: string) {
    setSelectedUf(val)
  }
  function handleSelectedCity(val: string) {
    setSelectedCity(val)
  }
  useEffect(() => {
    axios.get<IBGDEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then((response) => {
      let ufInitials = response.data.map(uf => uf.sigla)
      setUfs(ufInitials.sort())
    })
  }, [])

  useEffect(() => {
    if (selectedUf === '0') {
      return
    }
     
    axios.get<IBGDECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/distritos`).then((response) => {
      let cities = Array.from(new Set(response.data.map((city) => city.nome)))
      setCities(cities.sort())
    })
  }, [selectedUf])

  return (
    <ImageBackground source={require('../../assets/home-background.png')} imageStyle={{ width: 274, height: 368 }} style={styles.container}>
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />
        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiênte.</Text>
      </View>

      <View style={styles.footer}>
        <RNPickerSelect
          style={pickerSelectStyles}
          onValueChange={(value) => handleSelectedUf(value)}
          items={ufs.map(item => {return { label: item, value: item }})}
        />
        <RNPickerSelect
          style={pickerSelectStyles}
          onValueChange={(value) => handleSelectedCity(value)}
          items={cities.map(item => {return { label: item, value: item }})}
        />

        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Icon name="arrow-right" color="#FFF" size={24}/>
          </View>
          <Text style={styles.buttonText}>
            Entrar
          </Text>
        </RectButton>
      </View>
    </ImageBackground>
  )
}

export default Home

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#1e824c',
    borderRadius: 10,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 20,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#1e824c',
    borderRadius: 10,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 20,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  inputIOS: {
    //fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    //fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});