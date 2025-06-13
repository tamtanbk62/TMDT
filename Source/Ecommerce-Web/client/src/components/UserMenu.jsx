import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink } from "react-icons/hi";
import isAdmin from '../utils/isAdmin'
import { FiUser } from 'react-icons/fi'

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.logout
      })
      console.log("logout", response)
      if (response.data.success) {
        if (close) {
          close()
        }
        dispatch(logout())
        localStorage.clear()
        toast.success(response.data.message)
        navigate("/")
      }
    } catch (error) {
      console.log(error)
      AxiosToastError(error)
    }
  }

  const handleClose = () => {
    if (close) {
      close()
    }
  }
  return (
    <div>
      <div className="flex flex-col items-center text-center">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border mb-2" />
        ) : (
          <FiUser size={35} className="mb-2" />
        )}
        <span>
          Hello <span className="font-semibold text-lg">{user.name}!</span>
        </span>
      </div>

      <Divider />
      {
        !isAdmin(user.role) && (
          <>
            <div className='px-2 hover:bg-orange-200 py-1 cursor-pointer'>
              <a onClick={handleClose} href={"/profile"}>My Account</a>
            </div>
            <div className='px-2 hover:bg-orange-200 py-1 cursor-pointer'>
              <a onClick={handleClose} href={"/myorders"}>My Order</a>
            </div>
            <div className='px-2 hover:bg-orange-200 py-1 cursor-pointer'>
              <button onClick={handleLogout}>Log Out </button>
            </div>
            <div className='text-sm flex items-center gap-2'>
              {/* ... */}
            </div>
          </>
        )
      }




      <div className='text-sm grid gap-1'>
        {
          isAdmin(user.role) && (
            <Link onClick={handleClose} to={"/dashboard"} className='px-2 hover:bg-orange-200 py-1'>Thống kê</Link>
          )
        }
        {/* {
          isAdmin(user.role) && (
            <Link onClick={handleClose} to={"/dashboard/subcategory"} className='px-2 hover:bg-orange-200 py-1'>Sub Category</Link>
          )
        }

        {
          isAdmin(user.role) && (
            <Link onClick={handleClose} to={"/dashboard/upload-product"} className='px-2 hover:bg-orange-200 py-1'>Upload Product</Link>
          )
        }

        {
          isAdmin(user.role) && (
            <Link onClick={handleClose} to={"/dashboard/product"} className='px-2 hover:bg-orange-200 py-1'>Product</Link>
          )

        } */}
        {
          isAdmin(user.role) && (
            <button onClick={handleLogout} className='text-left px-2 hover:bg-orange-200 py-1'>Đăng xuất</button>
          )
        }

        {/* <Link onClick={handleClose} to={"/dashboard/myorders"} className='px-2 hover:bg-orange-200 py-1'>My Orders</Link>

            <Link onClick={handleClose} to={"/dashboard/address"} className='px-2 hover:bg-orange-200 py-1'>Save Address</Link>

            <button onClick={handleLogout} className='text-left px-2 hover:bg-orange-200 py-1'>Log Out</button> */}

      </div>
    </div>
  )
}

export default UserMenu
