import React, { useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInVND } from '../utils/DisplayPriceInVND'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { IoIosHome } from "react-icons/io";
import { FaAngleRight } from "react-icons/fa6";
import { useForm } from "react-hook-form"
import { useAddress } from '../hooks/useAddress';

function maskPhone(phone) {
  if (!phone) return '';
  const str = String(phone);
  if (str.length < 7) return str;
  return str.slice(0, 3) + '*****' + str.slice(-3);
}

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(null)
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const { fetchAddress, createAddress, updateAddress, deleteAddress } = useAddress()
  const [addressMode, setAddressMode] = useState('saved')
  const [showSavedList, setShowSavedList] = useState(false)
  const [editAddress, setEditAddress] = useState(null)
  const [formKey, setFormKey] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  const handleCashOnDelivery = async() => {
    if (!addressList[selectAddress]?._id) {
      toast.error("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }
    if (selectedPaymentMethod !== 'cash') {
      toast.error("Vui lòng chọn phương thức thanh toán khi nhận hàng!");
      return;
    }
    try {
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data : {
          list_items : cartItemsList,
          addressId : addressList[selectAddress]?._id,
          subTotalAmt : totalPrice,
          totalAmt :  totalPrice,
        }
      })

      const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              if(fetchCartItem){
                fetchCartItem()
              }
              if(fetchOrder){
                fetchOrder()
              }
              navigate('/success',{
                state : {
                  text : "Order"
                }
              })
          }

    } catch (error) {
      AxiosToastError(error)
    }
  }
  const onSubmit = async (data) => {
    try {
      if (addressMode === 'edit' && editAddress) {
        const success = await updateAddress({ ...data, _id: editAddress._id });
        if (success) {
          reset();
          setEditAddress(null);
          setAddressMode('saved');
          setShowSavedList(true);
        }
        return;
      }
      
      const success = await createAddress(data);
      if (success) {
        reset();
        setAddressMode('saved');
        setShowSavedList(true);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleOnlinePayment = async()=>{
    if (!addressList[selectAddress]?._id) {
      toast.error("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }
    if (selectedPaymentMethod !== 'vnpay') {
      toast.error("Vui lòng chọn phương thức thanh toán VNPay!");
      return;
    }
    try {
      toast.loading("Loading...")
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY
      console.log("stripePublicKey",stripePublicKey)
      const stripePromise = await loadStripe(stripePublicKey)
     
      const response = await Axios({
          ...SummaryApi.payment_url,
          data : {
            list_items : cartItemsList,
            addressId : addressList[selectAddress]?._id,
            subTotalAmt : totalPrice,
            totalAmt :  totalPrice,
          }
      })

      const { data : responseData } = response

      stripePromise.redirectToCheckout({ sessionId : responseData.id })
      
      if(fetchCartItem){
        fetchCartItem()
      }
      if(fetchOrder){
        fetchOrder()
      }
    } catch (error) {
        AxiosToastError(error)
    }
  }

  const handlePlaceOrder = () => {
    // Kiểm tra địa chỉ
    if (!addressList[selectAddress]?._id) {
      toast.error("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }
    // Kiểm tra phương thức thanh toán
    if (!selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    // Gọi hàm xử lý tương ứng
    if (selectedPaymentMethod === 'cash') {
      handleCashOnDelivery();
    } else if (selectedPaymentMethod === 'vnpay') {
      handleOnlinePayment();
    } else {
      toast.error("Phương thức thanh toán không hợp lệ!");
    }
  };


  const handleEditAddress = (address) => {
    setEditAddress(address);
    setAddressMode('edit');
    setShowSavedList(false);
    reset({
      name: address.name,
      email: address.email,
      mobile: address.mobile,
      province: address.province,
      district: address.district,
      ward: address.ward,
      address_line: address.address_line,
    });
  };


  const handleDeleteAddress = async (id) => {
    await deleteAddress(id);
  };
  return (
    <section className="checkout-section bg-white min-h-screen py-8">
      <div className="breadcrumb-section h-24 bg-[#f8f8f8] flex items-center justify-between py-7 px-8 md:px-32">
        <h2 className="text-2xl font-bold">Thanh toán</h2>
        <div className='breadcrumb flex items-center gap-2 h-10'>
          <a href='/'><IoIosHome className='text-gray-500 text-xl' /></a>
          <FaAngleRight className='text-gray-500 text-base' />
          <span className=' text-black-500 font-medium'>Thanh toán</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8 mt-8">
        {/* Left: Form */}
        <div className="w-full md:w-[70%]">
          <div className="bg-[#f8f8f8] rounded-lg shadow p-8 mb-8">
            <h4 className="address-title font-semibold text-xl mb-4">Địa chỉ giao hàng</h4>
            <div className="flex gap-4 mb-4">
              <button
                className={`px-4 py-2 rounded ${addressMode === 'saved' ? 'bg-red-600 text-white' : 'bg-white text-black border'}`}
                onClick={() => setAddressMode('saved')}
              >
                Địa chỉ đã lưu
              </button>
              <button
                className={`px-4 py-2 rounded ${addressMode === 'new' ? 'bg-red-600 text-white' : 'bg-white text-black border'}`}
                onClick={() => {
                  setAddressMode('new');
                  setEditAddress(null);
                  reset({
                    name: '',
                    email: '',
                    mobile: '',
                    province: '',
                    district: '',
                    ward: '',
                    address_line: ''
                  });
                  setFormKey(prev => prev + 1);
                }}
              >
                Địa chỉ mới
              </button>
            </div>
            {addressMode === 'saved' && (
              <div>
                <div className="flex items-center gap-2 cursor-pointer mb-4" onClick={() => setShowSavedList((v) => !v)}>
                  <span className="font-semibold">Chọn địa chỉ đã lưu</span>
                  <FaAngleRight className={`text-xl transition-transform duration-200 ${showSavedList ? 'rotate-90' : ''}`} />
                </div>
                {showSavedList && (
                  <div className='bg-white grid gap-4 max-h-[350px] overflow-y-auto scrollbar-none'>
                    {addressList.length === 0 ? (
                      <div className="text-center text-gray-500 py-4">Không có địa chỉ nào được lưu</div>
                    ) : (
                      addressList.map((address, index) => (
                        <label htmlFor={"address" + index} className={!address.status && "hidden"} key={address._id}>
                          <div className='border rounded p-3 flex gap-3 hover:bg-blue-50 items-center justify-between'>
                            <div>
                              <input id={"address" + index} type='radio' value={index} onChange={(e) => setSelectAddress(parseInt(e.target.value))} checked={selectAddress === index} name='address' />
                            </div>
                            <div className="flex-1">
                              <p className='font-semibold'>{address.name}</p>
                              <p>(+84){maskPhone(address.mobile)}</p>
                              <p>{address.address_line}</p>
                              <p>{address.ward}</p>
                              <p>{address.district}</p>
                              <p>{address.province}</p>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <button
                                type="button"
                                className="px-3 py-1 bg-yellow-400 text-white rounded text-xs"
                                onClick={() => handleEditAddress(address)}
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                                onClick={() => handleDeleteAddress(address._id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
            {(addressMode === 'new' || addressMode === 'edit') && (
              <form key={formKey} className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label className="block mb-1 font-medium">Họ và tên <span className="text-red-500">*</span></label>
                  <input {...register('name', { required: true })} type="text" placeholder="Họ và tên" className="w-full border rounded px-3 py-2" />
                  {errors.name && <span className="text-red-500 text-xs">Vui lòng nhập họ tên</span>}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Email <span className="text-red-500">*</span></label>
                  <input {...register('email', { required: true })} type="email" placeholder="Email" className="w-full border rounded px-3 py-2" />
                  {errors.email && <span className="text-red-500 text-xs">Vui lòng nhập email</span>}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Số điện thoại <span className="text-red-500">*</span></label>
                  <input {...register('mobile', { required: true })} type="text" placeholder="Số điện thoại" className="w-full border rounded px-3 py-2" />
                  {errors.mobile && <span className="text-red-500 text-xs">Vui lòng nhập số điện thoại</span>}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                  <input {...register('province', { required: true })} type="text" placeholder="Tỉnh / Thành phố" className="w-full border rounded px-3 py-2" />
                  {errors.province && <span className="text-red-500 text-xs">Vui lòng nhập tỉnh/thành phố</span>}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Quận / huyện <span className="text-red-500">*</span></label>
                  <input {...register('district', { required: true })} type="text" placeholder="Quận / huyện" className="w-full border rounded px-3 py-2" />
                  {errors.district && <span className="text-red-500 text-xs">Vui lòng nhập quận/huyện</span>}
                </div>
                <div>
                  <label className="block mb-1 font-medium">Phường / Xã <span className="text-red-500">*</span></label>
                  <input {...register('ward', { required: true })} type="text" placeholder="Phường / Xã" className="w-full border rounded px-3 py-2" />
                  {errors.ward && <span className="text-red-500 text-xs">Vui lòng nhập phương / xã</span>}
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Địa chỉ <span className="text-red-500">*</span></label>
                  <input {...register('address_line', { required: true })} type="text" placeholder="Địa chỉ" className="w-full border rounded px-3 py-2" />
                  {errors.address_line && <span className="text-red-500 text-xs">Vui lòng nhập địa chỉ</span>}
                </div>
                <div className="md:col-span-2 flex justify-end mt-4 gap-2">
                  {addressMode === 'edit' && (
                    <button
                      type="button"
                      className="px-6 py-2 bg-gray-300 text-black rounded font-semibold"
                      onClick={() => {
                        setAddressMode('saved');
                        setEditAddress(null);
                        setShowSavedList(true);
                        reset();
                      }}
                    >
                      Hủy
                    </button>
                  )}
                  <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded font-semibold">
                    {addressMode === 'edit' ? 'Cập nhật địa chỉ' : 'Lưu địa chỉ'}
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="bg-[#f8f8f8] rounded-lg shadow p-8">
            <h4 className="payment-title font-semibold text-xl mb-4">Tùy chọn thanh toán</h4>
            <div className="payment-details flex flex-col gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  className="form-check-input"
                  type="radio"
                  name="payment_method"
                  value="cash"
                  checked={selectedPaymentMethod === 'cash'}
                  onChange={() => setSelectedPaymentMethod('cash')}
                />
                <span className="font-medium">Thanh toán khi nhận hàng</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  className="form-check-input"
                  type="radio"
                  name="payment_method"
                  value="vnpay"
                  checked={selectedPaymentMethod === 'vnpay'}
                  onChange={() => setSelectedPaymentMethod('vnpay')}
                />
                <span className="font-medium">Thanh toán bằng Stripe</span>
              </label>
            </div>
          </div>
        </div>
        {/* Right: Summary */}
        <div className="w-full md:w-[35%]">
          <div className="bg-[#f8f8f8] rounded-lg shadow p-8">
            <h3 className="text-lg font-semibold mb-4">Tóm tắt Đặt hàng</h3>
            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto mb-4">
              {cartItemsList.map((item, idx) => (
                <div key={item._id + 'summary'} className="flex items-center gap-3">
                  <img src={item.productId.image[0]} alt={item.productId.name} className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-2">{item.productId.name} X {item.quantity}</p>
                  </div>
                  <div className="text-right font-semibold text-sm whitespace-nowrap">
                    {DisplayPriceInVND(item.productId.price)}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tổng phụ</span>
                <span>{DisplayPriceInVND(notDiscountTotalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Vận chuyển</span>
                <span>0 đ</span>
              </div>
              <div className="flex justify-between">
                <span>Phiếu giảm giá/Mã</span>
                <span>0 đ</span>
              </div>
              <div className="flex justify-between font-bold text-base text-red-600">
                <span>Tổng cộng (VND)</span>
                <span>{DisplayPriceInVND(totalPrice)}</span>
              </div>
            </div>
            <button
              className="w-full mt-6 py-3 bg-red-600 hover:bg-red-700 rounded text-white font-semibold text-lg"
              onClick={handlePlaceOrder}
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div> 
    </section>
  )
}

export default CheckoutPage
