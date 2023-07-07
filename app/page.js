"use client"
import Image from 'next/image'
import Header from '@/components/Header'
import { useState, useEffect } from 'react'

export default function Home() {

  const [productForm, setproductForm] = useState({})
  const [products, setProducts] = useState([])
  const [alert, setAlert] = useState("")
  const [dropdown, setDropdown] = useState([])
  const [query, setQuery] = useState(" ")
  const [loading, setLoading] = useState(false)
  const [loadingaction, setLoadingaction] = useState(false)


  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch('/api/product')
      let rjson = await response.json()
      setProducts(rjson.products)
    }
    fetchProducts()
  }, [])

  const buttonAction = async (action, slug, initialQuantity) => {//For Product
    let index = products.findIndex((item)=> item.slug == slug)
    let newProducts = JSON.parse(JSON.stringify(products))
    if(action == "plus"){
      newProducts[index].quantity = parseInt(initialQuantity) + 1
    }
    else{
      newProducts[index].quantity = parseInt(initialQuantity) - 1
    }
    setProducts(newProducts)

    //for dropdown
    let indexdrop = dropdown.findIndex((item)=> item.slug == slug)
    let newDropdown = JSON.parse(JSON.stringify(dropdown))
    if(action == "plus"){
      newDropdown[indexdrop].quantity = parseInt(initialQuantity) + 1
    }
    else{
      newDropdown[indexdrop].quantity = parseInt(initialQuantity) - 1
    }
    setDropdown(newDropdown)

    setLoadingaction(true)
    const response = await fetch('/api/action', {
      method: 'POST',
      headers: {
        'Content-Tye': 'application/json'
      },
      body: JSON.stringify({ action, slug , initialQuantity})
    });
    setLoadingaction(false)
  }

  const addProduct = async (e) => {
    try {
      const response = await fetch('/api/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productForm)
      });

      if (response.ok) {
        // Product added successfully
        setAlert("Your Product has been added!")
        setProductForm({})
      } else {
        // Handle error case
        console.error('Error adding product');
      }
    } catch (error) {
      console.error('Error:', error);
    }
    // Fetch all the products again to sync back
    const response = await fetch('/api/product')
    let rjson = await response.json()
    setProducts(rjson.products)
    e.preventDefault();
  }

  const handleChange = (e) => {
    setproductForm({ ...productForm, [e.target.name]: e.target.value });
  }
  const onDropdownEdit = async (e) => {
    let value = e.target.value
    setQuery(value)
    if (value.length > 3) {
      setLoading(true)
      setDropdown([])
      const response = await fetch('/api/search?query=' + query)
      let rjson = await response.json()
      setDropdown(rjson.products)
      setLoading(false)
    }
    else {
      setDropdown([])
    }
  }

  return (
    <div className='bg-blue-200'>
      <Header />
      <div className="container bg-blue-50 mx-auto my-8 rounded-xl p-3 ">
        <div className='text-green-800 text-center'>{alert}</div>
        <h1 className='text-3xl font-bold mb-6 px-2'>Search a Product</h1>
        <div className="flex mb-2">
          <input onChange={onDropdownEdit} type='text' placeholder='Enter a Product Name' className='flex-1 border border-gray-300 px-4 py-2 rounded-l-md w-full' />
          <select className='border border-gray-300 px-4 py-2 rounded-r-md'>
            <option value="">ALL</option>
            <option value="category1">category1</option>
            <option value="category2">category2</option>
          </select>
        </div>
        {loading && <div className="flex justify-center items-center rounded-l-md">
          <svg fill="#000000" height="180px" width="180px" version='1.1' id='Layer_1' viewBox="0 0 330 330">
            <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke="#000" stroke-width="4" strokeDasharray="31.415, 31.415" strokeDashoffset="0">
              <animate attributeName="stroke-dashoffset" dur="1.5s" repeatCount="indefinite" from="0" to="62.83" />
              <animate attributeName="stroke-dasharray" dur="1.5s" repeatCount="indefinite" values="31.415, 31.415; 0,62.83; 31.415,31,415" />
            </circle>
          </svg>
        </div>
        }
        <div className="dropcontainer absolute w-[72vw] bg-purple-100 rounded-md  border-1 rounded-xl-md">
          {dropdown.map(item => {
            return <div key={item.slug} className='container flex justify-between p-2 my-1 border-b-2'>
              <span className="slug"> {item.slug} ({item.quantity} available for {item.price}Rs) </span>
              <div className="mx-5">
                <button onClick={() => { buttonAction("minus", item.slug, item.quantity)}} disabled={loadingaction} className="subtract inline-block px-3 py-1 bg-purple-500 text-white cursor-pointer font semi-bold rounded-lg shadow-md disabled: bg-black-200"> - </button>
                <span className="quantity inline-block w-3 mx-3">{item.quantity}</span>
                <button onClick={() => { buttonAction("plus", item.slug, item.quantity)}} disabled={loadingaction} className="add inline-block px-3 py-1 p-1 bg-purple-500 text-white cursor-pointer font semi-bold rounded-lg shadow-md disabled: bg-black-200"> + </button>
              </div>
            </div>
          })}
        </div>
      </div>
      {/*Display Current Stock */}
      <div className="container bg-blue-50 mx-auto my-8 rounded-xl p-3">
        <h1 className='text-3xl font-bold mb-6 px-2'>Add a Product</h1>
        <form>
          <div className="mb-4">
            <label htmlFor='productName' className='block mb-2 px-2 font-bold'> Product Slug </label>
            <input value={productForm?.slug || ""} name='slug' onChange={handleChange} type='text' id='productName' className='w-full border border-gray-300 px-4 py-2' />
          </div>

          <div className='mb-4'>
            <label htmlFor='price' className='block mb-2 px-2 font-bold'> Quantity</label>
            <input value={productForm?.quantity || ""} name='quantity' onChange={handleChange} type='number' id="quantity" className='w-full border border-gray-300 px-4 py-2' />
          </div>

          <div className='mb-4'>
            <label htmlFor='price' className='block mb-2 px-2 font-bold'> Price</label>
            <input value={productForm?.price || ""} name='price' onChange={handleChange} type='number' id="price" className='w-full border border-gray-300 px-4 py-2' />
          </div>

          <div className="flex justify-center p-3">
            <button onClick={addProduct} type="submit" className="bg-blue-500 hover:bg-blue-600 rounded-lg text-white px-4 py-2">Add Product</button>
          </div>

        </form>
      </div>

      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Display Current Stock</h1>
        <div className="shadow overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-6 py-3 text-left">Product Name</th>
                <th className="px-6 py-3 text-center">Quantity</th>
                <th className="px-6 py-3 text-center">Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.slug}>
                  <td className="border-t px-6 py-4">{product.slug}</td>
                  <td className="border-t px-6 py-4 text-center">{product.quantity}</td>
                  <td className="border-t px-6 py-4 text-center">{product.price} Rs/Item </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  )
}
