import { useState, ChangeEvent } from 'react'
import ZipFiles from './ZipFiles'

const ImageConverter = () => {
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [imageNames, setImageNames] = useState<string[]>([])
    const [unprocessedImageSizes, setUnprocessedImageSizes] = useState<string[]>([])
    const [processedImageSizes, setProcessedImageSizes] = useState<string[]>([])
    const [fileSelector, setFileSelector] = useState<HTMLInputElement | null>(null)
    const unprocessedImageSizesArray: string[] = []
    const processedImageSizesArray: string[] = []

    const processFile = async (file: File) => {
        if (!file) {
            return
        }
        const imageURL = await loadImage(file)
        const webpURL = await convertToWebp(imageURL)

        return webpURL
    }

    const loadImage = async (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader()

            reader.onload = (e: ProgressEvent<FileReader>) => {
                resolve(e.target?.result as string)
            };
            const fileSize = file.size / 1024 / 1024
            unprocessedImageSizesArray.push(fileSize.toFixed(2))
            setUnprocessedImageSizes([...unprocessedImageSizesArray])
            reader.readAsDataURL(file)
        });
    }

    const convertToWebp = async (imageURL: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = imageURL
            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.width
                canvas.height = img.height
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.drawImage(img, 0, 0)

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const webpURL = URL.createObjectURL(blob)
                            const fileSize = blob.size / 1024 / 1024
                            processedImageSizesArray.push(fileSize.toFixed(2))
                            setProcessedImageSizes([...processedImageSizesArray])
                            resolve(webpURL)
                        }
                    }, 'image/webp')
                }
            };
        });
    }

    const fileSelectorChanged = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        const processedPreviews: string[] = []
        const processedImageNames: string[] = []

        if (files) {
            for (const file of Array.from(files)) {
                processFile(file).then((webpURL) => {
                    if (webpURL) {
                        const fileNameWithoutExtension = file.name.slice(0, file.name.lastIndexOf('.'))
                        processedPreviews.push(webpURL)
                        processedImageNames.push(fileNameWithoutExtension)
                        setImagePreviews([...processedPreviews])
                        setImageNames([...processedImageNames])
                    }
                });
            }
        }

        if (fileSelector) {
            fileSelector.value = ''
        }
    }

    return (
        <div className='flex flex-col justify-center items-center z-40'>
            <h1 className='text-center text-6xl font-bold text-slate-600 mt-12'>Image to WebP</h1>

            <div className="flex items-center justify-center w-full z-40 relative py-32 px-2 md:px-32">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-400 border-dashed rounded-lg cursor-pointer bg-none">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-slate-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                        </svg>
                        <p className="mb-2 text-sm text-slate-700"><span className="font-semibold">Click to upload</span></p>
                        <p className="text-xs text-slate-700">SVG, PNG, JPG</p>
                    </div>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={(input) => setFileSelector(input)}
                        onChange={fileSelectorChanged}
                        className='hidden'
                    />
                </label>
            </div>

            <ZipFiles images={imagePreviews} imageNames={imageNames} />

            <section className="mt-8 pb-16 px-2 md:px-32" aria-labelledby="gallery-heading">
                <ul
                    role="list"
                    className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
                >
                    {imagePreviews.map((imageURL, index) => (
                        <li key={index} className="relative">
                            <div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden shadow-md h-64">
                                <img
                                    src={imageURL}
                                    alt={`Image ${index}`}
                                    className="group-hover:opacity-75 object-cover w-full h-full"
                                />
                                <a href={imageURL} download={`${imageNames[index]}.webp`} className="absolute inset-0 focus:outline-none">
                                    <span className="sr-only">View details for</span>
                                </a>
                            </div>
                            <p className="mt-2 text-sm font-medium text-gray-900 truncate">
                                {imageNames[index]}
                            </p>
                            <p className="mt-2 text-sm font-medium text-gray-900 truncate">
                                Original size: {unprocessedImageSizes[index]} MB
                            </p>
                            <p className="mt-2 text-sm font-medium text-gray-900 truncate">
                                Converted size: {processedImageSizes[index]} MB
                            </p>

                        </li>
                    ))}
                </ul>
            </section>

        </div>
    )
}

export default ImageConverter