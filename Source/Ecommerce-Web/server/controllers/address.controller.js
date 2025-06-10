import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js"; 

export const addAddressController = async(request,response)=>{
    try {
        const userId = request.userId // middleware
        const { address_line , province, district, ward, name, mobile, email } = request.body

        const createAddress = new AddressModel({
            name,
            email,
            address_line,
            province,
            district,
            ward,
            mobile,
            userId : userId 
        })
        const saveAddress = await createAddress.save()

        const addUserAddressId = await UserModel.findByIdAndUpdate(userId,{
            $push : {
                address_details : saveAddress._id
            }
        })

        return response.json({
            message : "Address Created Successfully",
            error : false,
            success : true,
            data : saveAddress
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getAddressController = async(request,response)=>{
    try {
        const userId = request.userId // middleware auth

        const data = await AddressModel.find({ userId : userId }).sort({ createdAt : -1})

        return response.json({
            data : data,
            message : "List of address",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error ,
            error : true,
            success : false
        })
    }
}

export const updateAddressController = async(request,response)=>{
    try {
        const userId = request.userId // middleware auth 
        const { _id, address_line, province, district, ward, name, email, mobile } = request.body 

        const updateAddress = await AddressModel.updateOne({ _id : _id, userId : userId },{
            address_line,
            province,
            district,
            ward,
            mobile,
            name,
            email
        })

        return response.json({
            message : "Address Updated",
            error : false,
            success : true,
            data : updateAddress
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const deleteAddresscontroller = async(request,response)=>{
    try {
        const userId = request.userId // auth middleware    
        const { _id } = request.body 

        // Delete the address from database
        const deleteAddress = await AddressModel.deleteOne({ _id : _id, userId })

        // Remove address reference from user's address_details array
        await UserModel.updateOne(
            { _id: userId },
            { $pull: { address_details: _id } }
        )

        return response.json({
            message : "Address deleted successfully",
            error : false,
            success : true,
            data : deleteAddress
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

