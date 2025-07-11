        <!-- 虚拟列表
        <div class="header">
            <div class="virtual">
                <div v-for="(item, index) in list" :key="index" class="item">
                    {{ item }}
                </div>
            </div>
        </div> -->
        <template>
            <div class="virtual-list-container">
                <VirtuaList 
                    :list="filteredList" 
                    ref="virtualListRef"
                    class="virtual-list"
                ></VirtuaList>
            </div>
        </template>
<!-- <template lang="pug">
    <div>
        div
            input(type="text" style="1px solid black" v-model="inputValue")
        div
            input(type="text" style="1px solid black" v-model="inputValue")
            button() 添加
            ul
                li(v-for="(item, index) in list" :key="index") {{ item }}
    </div>
</template> -->

<script lang="ts" setup>
import { ref } from 'vue'
const list = [1, 2, 3, 4]
const inputValue = ref('')

// const list = ref(new Array(100000).fill(0).map((_, index) => `第${index}个元素`))
</script>

<style scoped>
/* .header {
    height: 450px;
    border: 1px solid red;
}

.virtual {
    height: 450px;
}

.item {
    height: 30px;
    border: 1px solid blue;
} */
</style>