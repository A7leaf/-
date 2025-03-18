exports.handler = async function(event, context) {
  // 只接受 POST 请求
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // 解析请求体中的数据
    const data = JSON.parse(event.body);
    const { email, password } = data;
    
    // 这里可以添加你的验证逻辑
    console.log("收到登录请求:", email, password);
    
    // 你可以将数据存储到数据库或发送到其他服务
    // 例如发送到你自己的API或使用第三方服务
    
    // 返回成功响应
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "登录成功" })
    };
  } catch (error) {
    // 返回错误响应
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: "服务器错误" })
    };
  }
};