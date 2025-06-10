import React, { useEffect, useState } from 'react'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import { FaEye } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { TbEdit } from "react-icons/tb";
import { FaRegTrashCan } from "react-icons/fa6";

const ProductAdmin = () => {
  const [productData, setProductData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPageCount, setTotalPageCount] = useState(1)
  const [search, setSearch] = useState("")
  const [totalCount, setTotalCount] = useState(0);

  const fetchProductData = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: page,
          limit: 10,
          search: search
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        setTotalPageCount(responseData.totalNoPage)
        setProductData(responseData.data)
        setTotalCount(responseData.totalCount)
      }

    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [page])

  const handleNext = () => {
    if (page !== totalPageCount) {
      setPage(preve => preve + 1)
    }
  }
  const handlePrevious = () => {
    if (page > 1) {
      setPage(preve => preve - 1)
    }
  }

  const handleOnChange = (e) => {
    const { value } = e.target
    setSearch(value)
    setPage(1)
  }

  useEffect(() => {
    let flag = true

    const interval = setTimeout(() => {
      if (flag) {
        fetchProductData()
        flag = false
      }
    }, 300);

    return () => {
      clearTimeout(interval)
    }
  }, [search])

  return (
    <div className=''>
      <div className='dashboard px-2 bg-[#F8F8F8] min-h-[88vh] sticky top-0'>
        <div className='flex items-center justify-between pt-3 p-4'>
          <h1 className=" text-2xl font-semibold text-black ">Danh sách sản phẩm</h1>
          <div className=' bg-blue-50 px-4 flex items-center gap-3 py-2 rounded  border focus-within:border-primary-200'>
            <IoSearchOutline size={25} className='text-primary-200 ' />
            <input
              type='text'
              placeholder='Search product here ...'
              className='h-full w-full  outline-none bg-transparent'
              value={search}
              onChange={handleOnChange}
            />
          </div>
        </div>
        <div className="card-item flex flex-wrap gap-6 px-6 mt-2 pb-14">
          <div className=''>
            <div className='bg-white rounded-xl shadow'>

              <table className=' text-sm w-[75vw] '>
                <thead>
                  <tr className='bg-gray-100'>
                    <th className='p-2'>ID</th>
                    <th className='p-2'>TÊN</th>
                    <th className='p-2'>ẢNH</th>
                    <th className='p-2'>GIÁ BÁN</th>
                    <th className='p-2'>GIÁ SAU KHI GIẢM</th>
                    <th className='p-2'>SỐ LƯỢNG TRONG KHO</th>
                    <th className='p-2'>ĐÃ BÁN</th>
                    <th className='p-2'>CHỨC NĂNG</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-gray-500">Không có sản phẩm nào</td>
                    </tr>
                  ) : (
                    productData.map((p, index) => (
                      <tr key={p._id} className='bg-white border-b hover:bg-gray-50'>
                        <td className='py-2 px-4 truncate'>{p._id}</td>
                        <td className='py-2 px-4 max-w-[200px] truncate'>{p.name}</td>
                        <td className='py-2 px-2'>
                          <img src={p.image && p.image[0] ? p.image[0] : '/default.png'} alt={p.name} className='w-14 h-14 object-contain rounded' />
                        </td>
                        <td className='py-2 px-2'>{p.price?.toLocaleString()} đ</td>
                        <td className='py-2 px-10'>
                          {p.price
                            ? (p.discount
                              ? (p.price - (p.price * p.discount / 100)).toLocaleString()
                              : p.price.toLocaleString())
                            : 0} đ
                        </td>
                        <td className='py-2 px-2 items-center justify-center flex'>{p.stock}</td>
                        <td className='py-2 px-8'>{p.sold || 0}</td>
                        <td className='py-2 px-2 flex gap-2 items-center justify-center py-6'>
                          <button title='Xem' className='text-gray-500 hover:text-blue-600'><FaEye /></button>
                          <button title='Sửa' className='text-gray-500 hover:text-green-600'><TbEdit /></button>
                          <button title='Xóa' className='text-gray-500 hover:text-red-600'><FaRegTrashCan /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

            </div>
            <div className='flex items-center justify-between px-2  mt-8'>
              <span className='text-gray-600 text-sm'>
                {`Showing ${(page - 1) * 10 + 1} to ${Math.min(page * 10, totalCount)} of ${totalCount} results`}
              </span>
              <div className='flex items-center gap-1 rounded-lg border bg-white'>
                <button onClick={handlePrevious} disabled={page === 1} className={`px-2 py-1 rounded-l-lg ${page === 1 ? 'text-gray-300' : 'text-blue-500 hover:bg-blue-50'}`}>&lt;</button>
                {Array.from({ length: totalPageCount }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 ${page === i + 1 ? 'bg-blue-500 text-white' : 'text-blue-500 hover:bg-blue-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={handleNext} disabled={page === totalPageCount} className={`px-2 py-1 rounded-r-lg ${page === totalPageCount ? 'text-gray-300' : 'text-blue-500 hover:bg-blue-50'}`}>&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductAdmin
