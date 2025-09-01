# EmailJS 配置指南

## 📧 如何设置反馈邮件系统

### 第一步：注册 EmailJS 账号

1. 访问 [EmailJS官网](https://www.emailjs.com/)
2. 点击 "Sign Up" 注册免费账号
3. 验证邮箱并登录

### 第二步：创建邮件服务

1. 在控制台点击 "Add New Service"
2. 选择你的邮件提供商：
   - **Gmail**（需要复杂的权限配置）
   - **Outlook/Hotmail**（推荐，配置简单）
   - **Yahoo Mail**
   - **其他SMTP服务**
3. 按照指示连接你的邮箱
4. 记录下 **Service ID**

#### 🚨 Gmail认证问题解决方案

如果遇到 `Gmail_API: Request had insufficient authentication scopes` 错误：

1. **断开并重新连接Gmail**
2. **确保授权时选择所有权限**
3. **或者改用Outlook邮箱**（配置更简单）

### 第三步：创建邮件模板

1. 点击 "Email Templates" → "Create New Template"
2. 设置模板内容：

```
Subject: 🚀 Trading Simulator Feedback: {{feedback_subject}}

From: {{user_name}} ({{user_email}})
Type: {{feedback_type}}
Time: {{timestamp}}
Page: {{page_url}}

Message:
{{feedback_message}}

Screenshot:
{{feedback_image}}
```

3. 记录下 **Template ID**

### 第四步：获取公钥

1. 在控制台找到 "Account" → "General"
2. 复制 **Public Key**

### 第五步：更新配置

在 `feedback.html` 文件中，找到这部分代码并替换：

```javascript
const EMAILJS_CONFIG = {
    publicKey: 'YOUR_PUBLIC_KEY',     // 替换为你的公钥
    serviceId: 'YOUR_SERVICE_ID',     // 替换为你的服务ID
    templateId: 'YOUR_TEMPLATE_ID'    // 替换为你的模板ID
};
```

### 第六步：测试

1. 部署网站
2. 访问反馈页面
3. 填写表单并提交
4. 检查你的邮箱是否收到反馈邮件

## 📊 免费额度

- **每月200封邮件**（对于个人项目足够）
- 无需信用卡
- 支持图片附件（通过Base64编码）

## 🔧 高级配置

如果需要更多功能，可以考虑：
- 付费计划（更多邮件额度）
- 自定义邮件模板样式
- 添加自动回复功能

## 🚨 注意事项

1. **不要在代码中暴露敏感信息**
2. **定期检查邮件额度使用情况**
3. **测试所有表单字段是否正常工作**
4. **确保邮件不被标记为垃圾邮件**

## 🆘 故障排除

如果邮件发送失败：
1. 检查控制台是否有错误信息
2. 验证EmailJS配置是否正确
3. 检查网络连接
4. 确认邮件服务状态正常

配置完成后，用户就可以通过反馈页面向你发送带图片的反馈了！
