<template>
    <div class="login-container">
        <!-- 左侧装饰 -->
        <div class="decoration-left"></div>

        <!-- 登录表单 -->
        <div class="login-form">
            <h2>用户登录</h2>
            <form @submit.prevent="handleClick">
                <div class="input-group">
                    <label for="username">用户名</label>
                    <input type="text" id="username" v-model="form.username" placeholder="请输入用户名" required />
                </div>

                <div class="input-group">
                    <label for="password">密码</label>
                    <input type="password" id="password" v-model="form.password" placeholder="请输入密码" required />
                </div>

                <div class="options">
                    <label class="remember-me">
                        <input type="checkbox" v-model="form.remember" />
                        <span>记住我</span>
                    </label>
                    <a href="#" class="forgot-password">忘记密码?</a>
                </div>

                <input type="submit" value="登录" class="submit-btn" />
            </form>

            <p class="register-link">没有账号? <a href="#">立即注册</a></p>
        </div>

        <!-- 右侧装饰 -->
        <div class="decoration-right"></div>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user'
import type { LoginParams } from '../types/interfaces/user'

const router = useRouter();
const userStore = useUserStore();

const form = reactive<LoginParams>({
    username: '',
    password: '',
    remember: false
});

const handleClick = async () => {
    try {
        const res = await axios.post('/login', {
            username: form.username,
            password: form.password
        });

        if (res.data.code === 200) {
            // 先保存到 localStorage（路由守卫会检查这个）
            localStorage.setItem('user', JSON.stringify(res.data.data));
            // 再设置到 Pinia store
            userStore.setUserInfo(res.data.data);
            router.push('/index');
        }
    } catch (error) {
        console.error('登录失败:', error);
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f5f7fa;
    position: relative;
    padding: 20px;
}

.login-form {
    background: white;
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    width: 100%;
    max-width: 420px;
    z-index: 1;
    /* 定义登录表单的淡入上滑动画，持续0.5秒，缓出效果 */
    animation: fadeInUp 0.5s ease-out;
}

.decoration-left,
.decoration-right {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 30%;
    /* 背景渐变色，从#f91807到#764ba2，角度135度 */
    background: linear-gradient(135deg, #f91807 0%, #764ba2 100%);
    z-index: 0;
}

.decoration-left {
    left: 0;
    /* clip-path创建左侧装饰块的三角形形状 */
    clip-path: polygon(0 0, 100% 0, 0 100%);
}

.decoration-right {
    right: 0;
    /* clip-path创建右侧装饰块的三角形形状 */
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
}

h2 {
    text-align: center;
    color: #1a1a1a;
    margin-bottom: 2rem;
    font-size: 1.8rem;
}

.input-group {
    margin-bottom: 1.2rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    color: #333;
    font-weight: 500;
}

input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
}

.remember-me {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.remember-me input {
    margin-right: 0.5rem;
}

.forgot-password {
    color: #667eea;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s ease;
}

.forgot-password:hover {
    color: #5a67d8;
}

.submit-btn {
    width: 100%;
    padding: 0.75rem;
    background: #667eea;
    border: none;
    border-radius: 6px;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.submit-btn:hover {
    background: #5a67d8;
    transform: translateY(-2px);
}

.register-link {
    text-align: center;
    margin-top: 1.5rem;
    color: #666;
    font-size: 0.95rem;
}

.register-link a {
    color: #667eea;
    text-decoration: none;
    margin-left: 0.3rem;
    transition: color 0.3s ease;
}

.register-link a:hover {
    color: #5a67d8;
}

@keyframes fadeInUp {

    /* 定义fadeInUp动画的关键帧，从透明和下移20px到完全显示和原位 */
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>