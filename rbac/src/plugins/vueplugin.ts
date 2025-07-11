import { useUserStore } from '../stores/user'

// 这是一个权限控制插件，用于实现按钮级别的权限控制
// 通过自定义指令 v-auth 来控制按钮的显示/隐藏
// 基于用户权限（auths）来控制按钮的可见性
const myVueplugin = (app: any) => {
    // 注册全局组件和注册全局指令
    app.directive('auth', {
        mounted(el: any, binding: any) {
            // el 指令绑定的真实dom 元素，binding 是自定义指令绑定信息
            const btnAuth = binding.value;
            const userStore = useUserStore();
            // console.log('权限检查:', {
            //     buttonAuth: btnAuth,
            //     userPermissions: userStore.buttonPermissions
            // });

            if (!userStore.buttonPermissions.includes(btnAuth)) {
                el.parentNode?.removeChild(el);
            }
        },
        updated(el: any, binding: any) {
            const btnAuth = binding.value;
            const userStore = useUserStore();
            // console.log('权限更新检查:', {
            //     buttonAuth: btnAuth,
            //     userPermissions: userStore.buttonPermissions
            // });

            if (!userStore.buttonPermissions.includes(btnAuth)) {
                el.parentNode?.removeChild(el);
            }
        }
    });
}

export default myVueplugin