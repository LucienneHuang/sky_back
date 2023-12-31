import { StatusCodes } from 'http-status-codes'
import products from '../models/products.js'
import { getMessageFromValidationError } from '../utils/error.js'

export const create = async (req, res) => {
  const newArray = []
  if (typeof req.files.images !== 'undefined') {
    req.files.images.forEach(element => {
      newArray.push(element.path)
    })
  }
  try {
    const result = await products.create({
      user: req.body.user,
      name: req.body.name,
      price: req.body.price,
      currency: req.body.currency,
      MaxNumber: req.body.MaxNumber,
      image: req.files.image[0].path,
      images: newArray,
      description: req.body.description,
      category: req.body.category,
      sell: req.body.sell,
      date: req.body.date
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}

// 取所有商品，給管理員看的
export const getAll = async (req, res) => {
  try {
    const result = await products.find({
      $or: [
        { name: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
        { category: new RegExp(req.query.search, 'i') }
      ]
    }).populate('user', 'nickname')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}
// 取所有自己的商品
export const getOwn = async (req, res) => {
  try {
    const result = await products.find({
      user: req.user._id,
      $or: [
        { name: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
        { category: new RegExp(req.query.search, 'i') }
      ]
    })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

// 給前端看的，get 只找有上架的東西
export const get = async (req, res) => {
  try {
    const result = await products.aggregate([
      {
        $match: {
          sell: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          pipeline: [
            { $project: { nickname: 1 } }
          ],
          as: 'user'
        }
      },
      { $unwind: { path: '$user' } },
      {
        $match: {
          $or: [
            { 'user.nickname': new RegExp(req.query.search, 'gi') },
            { name: new RegExp(req.query.search, 'gi') },
            { description: new RegExp(req.query.search, 'gi') },
            { category: new RegExp(req.query.search, 'gi') }
          ]
        }
      },
      { $sort: { date: req.query.sortOrder === 'asc' ? 1 : -1 } },
      {
        $facet: {
          count: [{ $count: 'count' }],
          sample: [{ $skip: parseInt((req.query.currentPage - 1) * req.query.productsPerPage) }, { $limit: parseInt(req.query.productsPerPage) }]
        }
      }
    ])
    // console.log(JSON.stringify(result, null, 2))

    // let result = await products
    //   .find({
    //     sell: true,
    //     $or: [
    //       { name: new RegExp(req.query.search, 'i') },
    //       { description: new RegExp(req.query.search, 'i') },
    //       { category: new RegExp(req.query.search, 'i') }
    //     ]
    //   })
    //   .populate('user', 'nickname')
    //   .sort({ date: req.query.sortOrder === 'asc' ? 1 : -1 })
    //   .skip((req.query.currentPage - 1) * req.query.productsPerPage)
    //   .limit(req.query.productsPerPage)
    // let count = await products.find({
    //   sell: true,
    //   $or: [
    //     { name: new RegExp(req.query.search, 'i') },
    //     { description: new RegExp(req.query.search, 'i') },
    //     { category: new RegExp(req.query.search, 'i') }
    //   ]
    // }).count()
    // if (result.length === 0) {
    //   result = await products
    //     .find({
    //       sell: true
    //     })
    //     .populate('user', 'nickname')
    //     .sort({ date: req.query.sortOrder === 'asc' ? 1 : -1 })
    //   result = result.filter((data) => data.user.nickname.indexOf(req.query.search) > -1)
    //   count = result.length
    //   const result2 = []
    //   for (let i = ((req.query.currentPage - 1) * req.query.productsPerPage); i < ((req.query.currentPage - 1) * req.query.productsPerPage + 9); i++) {
    //     if (typeof result[i] !== 'undefined') {
    //       result2.push(result[i])
    //     }
    //   }
    //   result = result2
    // }
    // if (count % req.query.productsPerPage === 0) {
    //   count = Math.floor(count / req.query.productsPerPage)
    // } else {
    //   count = Math.ceil(count / req.query.productsPerPage)
    // }
    // console.log(JSON.stringify(result, null, 2))
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        data: result[0]?.sample || [],
        count: Math.ceil((result[0]?.count?.[0]?.count || 1) / req.query.productsPerPage)
      }
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: '發生錯誤'
    })
  }
}

export const getId = async (req, res) => {
  try {
    // req.params.id => 為路由的參數的 id
    const result = await products.findById(req.params.id).populate('user', 'nickname')
    if (!result) {
      throw new Error('NOT FOUND')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}

export const editOwnProduct = async (req, res) => {
  try {
    const mainImg = req.files.image ? req.files.image[0].path : req.body.image
    const newArray = []
    if (typeof req.body.oldImgs !== 'undefined') {
      if (typeof req.body.oldImgs === 'string') {
        newArray.push(req.body.oldImgs)
      } else {
        req.body.oldImgs.forEach(element => {
          newArray.push(element)
        })
      }
    }
    if (typeof req.files.images !== 'undefined') {
      req.files.images.forEach(element => {
        newArray.push(element.path)
      })
    }
    const result = await products.findByIdAndUpdate(req.params.id, {
      user: req.body.user,
      name: req.body.name,
      price: req.body.price,
      currency: req.body.currency,
      MaxNumber: req.body.MaxNumber,
      image: mainImg,
      images: newArray,
      description: req.body.description,
      category: req.body.category,
      sell: req.body.sell
    }, { new: true, runValidators: true })
    if (!result) {
      throw new Error('NOT FOUND')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}
export const editBlockUserProduct = async (req, res) => {
  try {
    console.log('here')
    console.log(req.params.id)
    console.log(req.body.sell)
    const result = await products.findByIdAndUpdate(req.params.id, {
      sell: req.body.sell
    }, { new: true, runValidators: true })
    console.log('here2')
    if (!result) {
      throw new Error('NOT FOUND')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: getMessageFromValidationError(error)
      })
    } else if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}

export const getUserProducts = async (req, res) => {
  try {
    const result = await products.find({ user: req.params.id }, { _id: 1 })
    if (!result) {
      throw new Error('NOT FOUND')
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: '格式錯誤'
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '找不到'
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '發生錯誤'
      })
    }
  }
}
