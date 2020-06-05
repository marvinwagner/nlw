import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import axios from 'axios'
import { LeafletMouseEvent } from 'leaflet'
import './styles.css'

import { Map, TileLayer, Marker } from 'react-leaflet'

import Header from '../Header'
import api from '../../services/api'
import Dropzone from '../../components/Dropzone'

// sempre que usar estado pra criar array ou objeto, é obrigatório informar o tipo da variavel
interface Item {
  id: number;
  title: string;
  image_url: string;
}
interface IBGDEUFResponse {
  sigla: string;
}
interface IBGDECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUf, setSelectedUf] = useState<string>('0')
  const [selectedCity, setSelectedCity] = useState<string>('0')
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0])
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedFile, setSelectedFile] = useState<File>()

  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords
      setInitialPosition([latitude, longitude])
    })
  }, [])

  useEffect(() => {
    api.get('/items').then((response) => {
      setItems(response.data)
    })
  }, []) // segundo parametro vazio, vai ser executado apenas 1 vez a função

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

  function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value)
  }
  function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value)
  }
  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng])
  }
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value} = event.target
    setFormData({
      ...formData,
      [name]: value
    })
  }
  function handleSelectItem(id: number) {
    const selected = selectedItems.findIndex(item => item === id)
    if (selected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id)
      setSelectedItems(filteredItems)
    }
    else 
      setSelectedItems([...selectedItems, id])
  }
  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    const { name, email, whatsapp } = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectedItems

    const data = new FormData()
    data.append('name', name)
    data.append('email', email)
    data.append('whatsapp', whatsapp)
    data.append('uf', uf)
    data.append('city', city)
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('items', items.join(','))
    if (selectedFile)
      data.append('image', selectedFile)

    // const data = { name, email, whatsapp, uf, city, latitude, longitude, items }

    await api.post('points', data)

    history.push('/')
  }

  return (
    <div id="page-create-point">
      <Header>
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </Header>
        
      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/>ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input 
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input 
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition}>
            </Marker>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select name="uf" id="uf" onChange={handleSelectedUf}>
                <option value="0">Selecione um estado</option>
                { ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ) )}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select name="city" id="city" onChange={handleSelectedCity}>
                <option value="0">Selecione uma cidade</option>
                { cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ) )}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            { items.map(item => (
              <li 
                key={item.id} 
                className={selectedItems.includes(item.id) ? 'selected' : ''}
                onClick={() => handleSelectItem(item.id)}
              >
                <img src={item.image_url} alt={item.title} />
              </li>
            )) }
          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  )
}

export default CreatePoint;