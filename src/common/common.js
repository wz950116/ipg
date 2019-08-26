const common = {
  // 校验手机号
  validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },

  // 校验邮箱
  validateEmail(email) {
    let emails = email.replace(/^\s+|\s+$/g, "");
    return /^[\w\-\+]+(\.[\w\-\+]+)*@(\w-?)+(\.\w{2,})+$/.test(emails);
  },

  // 限制只能输入数字和-
  phoneFormat(value) {
    return value.replace(/[^\d\-\d]/g, "");
  },

  // 限制只能输入数字字母
  EmailFormat(value) {
    return value.replace(/[^\w\-\+\./@_-]/gi, "");
  },

  // 时间对象转换成字符串
  DateFormatter(date) {
    if (!date) return "";
    return date.getFullYear() + '-' + (date.getMonth() + 1 > 10 ? date.getMonth() + 1 : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() + 1 > 10 ? date.getDate() : '0' + date.getDate())
  }
};

export default common;
