<template>
    <div class="not-found">
        <div class="content">
            <h1>404</h1>
            <h2>页面未找到</h2>
            <p>抱歉，您访问的页面不存在或已被移除</p>
            <router-link to="/index" class="home-btn">返回首页</router-link>
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.not-found {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: #f5f7fa;
    text-align: center;
}

.content {
    padding: 2rem;
    animation: fadeIn 0.5s ease-out;
}

h1 {
    font-size: 8rem;
    margin: 0;
    color: #667eea;
    line-height: 1;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
    font-size: 2rem;
    color: #2d3748;
    margin: 1rem 0;
}

p {
    color: #718096;
    margin-bottom: 2rem;
}

.home-btn {
    display: inline-block;
    padding: 0.75rem 2rem;
    background: #667eea;
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    transition: all 0.3s ease;
}

.home-btn:hover {
    background: #5a67d8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

@keyframes fadeIn {
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