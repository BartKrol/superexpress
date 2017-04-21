const noop = () => {}

class Response {
  constructor(callback = noop) {
    this.callback = callback
  }

  status(status) {
    this.status = status
    return this
  }

  send(data) {
    this.body = data
    this.callback(null, this.createResponseObject())
  }

  json(data) {
    this.body = data
    this.callback(null, this.createResponseObject())
  }

  createResponseObject() {
    return {
      body: this.data,
      status: this.status
    }
  }
}

class SuperExpress {
  constructor(action) {
    this.action = action
    this.transformer = noop
    this.req = {}
  }

  params(params) {
    this.req.params = params
    return this
  }

  query(query) {
    this.req.query = query
    return this
  }

  body(body) {
    this.req.body = body
    return this
  }

  headers(headers) {
    this.req.headers = headers
    return this
  }

  extendReq(data) {
    Object.assign({}, this.req, data)
    return this
  }

  // extendRes(data) {
  //   Object.assign({}, this.res, data)
  //   return this
  // }

  next(callback) {
    this.nextFn = callback
    return this
  }

  beforeSend(transformer) {
    this.transformer = transformer
    return this
  }

  then(...args) {
    return new Promise((resolve, reject) => {
      this.end((err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
      .then(...args)
    })
  }

  end(callback = noop) {
    if (!this.action) {
      throw new Error('No action defined')
    }
    const next = (err) => {
      callback(err)
      return this.nextFn(this.req, this.res)
    }
    this.transformer.call(this)
    this.res = new Response(callback)
    try {
      this.action(this.req, new Response(callback), next)
    } catch (err) {
      callback(err)
    }
  }
}

module.exports = (action) => {
  return new SuperExpress(action)
}
