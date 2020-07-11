const successFlag = {
  flag: 1
}
const failFlag = {
  flag: 0
}
export default {
  '登陆成功': {
    status: 200,
    ...successFlag,
    msg: '登陆成功'
  },
  '成功注册': {
    status: 200,
    ...successFlag,
    msg: '成功注册'
  },
  '删除成功': {
    status: 200,
    ...successFlag,
    msg: '删除成功'
  },
  '用户名已存在': {
    status: 701,
    ...failFlag,
    msg: '用户名已存在'
  },
  '用户名或密码错误': {
    status: 702,
    ...failFlag,
    msg: '用户名或密码错误'
  },
  '登陆已过期': {
    status: 703,
    ...failFlag,
    msg: '登陆已过期'
  }
}