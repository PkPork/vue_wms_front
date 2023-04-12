import TabsView from '@/layouts/tabs/TabsView'
import BlankView from '@/layouts/BlankView'
import PageView from '@/layouts/PageView'

// 라우팅 구성
const options = {
    routes: [{
            path: '/login',
            name: '로그인 페이지',
            component: () => import('@/pages/login')
        },
        {
            path: '*',
            name: '404',
            component: () => import('@/pages/exception/404'),
        },
        {
            path: '/403',
            name: '403',
            component: () => import('@/pages/exception/403'),
        },
        {
            path: '/',
            name: '첫페이지',
            component: TabsView,
            redirect: '/workplace',
            children: [{
                    path: 'workplace',
                    name: '워크플레이스',
                    meta: {
                        icon: 'dashboard'
                    },
                    component: () => import('@/pages/workplace/WorkPlace'),
                },
                {
                    path: 'result',
                    name: '결과 페이지',
                    meta: {
                        icon: 'check-circle-o',
                    },
                    component: PageView,
                    children: [{
                            path: 'success',
                            name: '성공',
                            component: () => import('@/pages/result/Success')
                        },
                        {
                            path: 'error',
                            name: '불합격',
                            component: () => import('@/pages/result/Error')
                        }
                    ]
                },
                {
                    path: 'exception',
                    name: '예외 페이지',
                    meta: {
                        icon: 'warning',
                    },
                    component: BlankView,
                    children: [{
                            path: '404',
                            name: 'Exp404',
                            component: () => import('@/pages/exception/404')
                        },
                        {
                            path: '403',
                            name: 'Exp403',
                            component: () => import('@/pages/exception/403')
                        }
                    ]
                },
                {
                    path: 'components',
                    name: '컴포넌트',
                    meta: {
                        icon: 'appstore-o'
                    },
                    component: PageView,
                    children: [{
                        path: 'table',
                        name: '고급 양식',
                        component: () => import('@/pages/components/table')
                    }]
                },
            ]
        },
    ]
}

export default options