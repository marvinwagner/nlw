import React, { useState, useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'

import './styles.css'

interface Props {
  onFileUploaded: (file: File) => void
}

const Dropzone: React.FC<Props> = ({onFileUploaded}) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState('')

  const onDrop = useCallback(acceptedFiles => {
    // Do something with the files
    const file = acceptedFiles[0]
    const fileUrl = URL.createObjectURL(file)
    console.log(fileUrl)
    setSelectedFileUrl(fileUrl)
    onFileUploaded(file)
  }, [onFileUploaded])
  const {getRootProps, getInputProps} = useDropzone({ accept: 'image/*', multiple: false, onDrop })

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />
      { selectedFileUrl ?
        <img src={selectedFileUrl} alt="pointimg"/> :
        <p><FiUpload /> Arraste e solte a imagem aqui, ou clique para selecionar uma imagem</p>
      }
    </div>
  )
}

export default Dropzone