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
            router.push('/home/situation');
        }
    } catch (error) {
        console.error('登录失败:', error);
    }
}
</script>

<style scoped>
.login-container {
    position: relative;
    min-height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(ellipse at center, #0a1a2f 80%, #082c61 100%);
    overflow: hidden;
}


.login-form {
    position: relative;
    background: rgba(10, 30, 60, 0.85);
    border-radius: 16px;
    box-shadow: 0 0 32px 8px #1e90ff44, 0 0 0 2px #1e90ff;
    border: 1.5px solid #1e90ff;
    padding: 2.5rem 2.5rem 2rem 2.5rem;
    width: 370px;
    z-index: 2;
    animation: fadeInUp 0.7s cubic-bezier(.42, 0, .58, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
}


.decoration-left,
.decoration-right {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 32%;
    pointer-events: none;
    z-index: 1;
}

.decoration-left {
    left: 0;
    background: linear-gradient(135deg, #0a1a2f 60%, #1e90ff 100%);
    opacity: 0.25;
    clip-path: polygon(0 0, 100% 0, 0 100%);
}

.decoration-right {
    right: 0;
    background: linear-gradient(-135deg, #0a1a2f 60%, #1e90ff 100%);
    opacity: 0.25;
    clip-path: polygon(100% 0, 100% 100%, 0 100%);
}


h2 {
    text-align: left;
    color: #1e90ff;
    margin-bottom: 2rem;
    font-size: 2rem;
    font-family: 'Orbitron', '微软雅黑', sans-serif;
    letter-spacing: 2px;
    font-weight: 700;
    width: 100%;
}


.input-group {
    margin-bottom: 1.2rem;
    width: 100%;
}


label {
    display: block;
    margin-bottom: 0.5rem;
    color: #1e90ff;
    font-weight: 500;
    font-size: 1rem;
    letter-spacing: 1px;
}


input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid #1e90ff;
    border-radius: 8px;
    font-size: 1rem;
    background: rgba(20, 40, 80, 0.7);
    color: #fff;
    box-shadow: 0 0 8px #1e90ff33;
    transition: all 0.3s ease;
}


input[type="text"]:focus,
input[type="password"]:focus {
    outline: none;
    border-color: #00cfff;
    box-shadow: 0 0 0 2px #00cfff99;
}


.options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
    width: 100%;
}


.remember-me {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #1e90ff;
}


.remember-me input {
    margin-right: 0.5rem;
    accent-color: #1e90ff;
}


.forgot-password {
    color: #1e90ff;
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.3s ease;
}

.forgot-password:hover {
    color: #00cfff;
}


.submit-btn {
    width: 100%;
    padding: 0.85rem;
    background: linear-gradient(90deg, #1e90ff 0%, #00cfff 100%);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 1.15rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 0 12px #1e90ff66;
    letter-spacing: 2px;
    margin-top: 10px;
    transition: all 0.3s ease;
}

.submit-btn:hover {
    background: linear-gradient(90deg, #00cfff 0%, #1e90ff 100%);
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 0 24px #00cfff99;
}


.register-link {
    text-align: center;
    margin-top: 1.5rem;
    color: #1e90ff;
    font-size: 1rem;
    letter-spacing: 1px;
}

.register-link a {
    color: #00cfff;
    text-decoration: underline;
    margin-left: 0.3rem;
    transition: color 0.3s ease;
}

.register-link a:hover {
    color: #1e90ff;
}


@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(40px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 背景星空特效，可选：可用canvas或伪元素实现，简单用伪元素模拟 */
.login-container::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
    background: url('https://img.alicdn.com/imgextra/i3/O1CN01QvQw2V1wQvQw2V1wQvQw2V1wQvQw2V1wQvQw2V1wQvQw2V1wQvQw2V.png') repeat center center;
    opacity: 0.18;
}
</style>