// export const API_URL = 'http://localhost:8080/api/v1';
const API_URL = 'https://doan02-be-production.up.railway.app/api/v1/';

export const API = {
    AUTHENTICATE: {
        END_POINT: {
            LOGIN: API_URL + 'auth/authenticate',
            REGISTER: API_URL + 'auth/userRegister',
            GG_LOGIN: API_URL + 'auth/authenticateGoogleUser',
        },
        STATUS: {
            SYSTEM_ERROR: '0_1_f',
            CREATED_ACCOUNT_SUCCESSFUL: '1_1_s',
            ACCOUNT_EXISTED: '1_2_f',
            ACCOUNT_LOCKED: '1_3_f',
            ACCOUNT_INACTIVE: '1_4_f',
            ACCOUNT_NOT_FOUND: '1_5_f',
            BAD_CREDENTIAL: '1_6_f',
            AUTHENTICATE_SUCCESSFUL: '1_7_s',
        },
    },
    PRODUCT: {
        END_POINT: {
            PRODUCT: API_URL + 'product',
            SUB_CATEGORY: API_URL + 'product/sub-category',
            CATEGORY: API_URL + 'product/category',
            BRAND: API_URL + 'product/brand',
            ATTRIBUTES: API_URL + 'product/variety/attributes',
            ADD_ATTRIBUTES: API_URL + 'product/add-attribute',
            IMAGES: API_URL + 'product/product-images',
            DELETE_ATTRIBUTE: API_URL + 'product/delete-attribute',
            REVIEW: API_URL + 'rating',
            MOST_VIEW: API_URL + 'product/most-views',
            MOST_BUY: API_URL + 'product/most-buy',
        },
        STATUS: {
            GET_PRODUCT_SUCCESS: '0_2_s',
            FAIL: '0_1_f',
        },
    },
    IMPORT: {
        END_POINT: {
            IMPORT: API_URL + 'import',
            DETAIL: API_URL + 'import/items',
            GROUP: API_URL + 'import/groups',
        },
        STATUS: {
            GET_PRODUCT_SUCCESS: '0_2_s',
            FAIL: '0_1_f',
        },
    },
    PAYMENT: {
        END_POINT: {
            CHECK_OUT: API_URL + 'payment/user-cart-checkout',
            SINGLE_CHECKOUT: API_URL + 'payment/single-item-checkout',
            UNTAUTH_CHECK_OUT:
                API_URL + 'payment/un-authenticate/user-cart-checkout',
            UNTAUTH_SINGLE_CHECKOUT:
                API_URL + 'payment/un-authenticate/single-item-checkout',
        },
    },
    ORDER: {
        END_POINT: {},
        STATUS: {
            GET_PRODUCT_SUCCESS: '0_2_s',
            FAIL: '0_1_f',
        },
    },
    VOUCHER: {
        END_POINT: {
            VOUCHER: API_URL + 'voucher',
            AVAILABLE_VOUCHER: API_URL + 'voucher/available-voucher',
        },
        STATUS: {
            GET_PRODUCT_SUCCESS: '0_2_s',
            FAIL: '0_1_f',
        },
    },
    CHAT: {
        END_POINT: {
            CHAT_ROOM: API_URL + 'chat/getAllChatRoomByUserID',
            MESSAGES_BY_CHAT_ROOM:
                API_URL + 'chat/getAllMessageBySenderIDAndRecipientID',
            UNREAD_MESSAGES_COUNT: API_URL + 'chat/messages',
            SEEN_MESSAGE: API_URL + 'chat/seenMessage',
        },
        STATUS: {
            SUCCESS: '0_2_s',
            FAIL: '0_1_f',
        },
    },
    INVOICE: {
        END_POINT: {
            INVOICE: API_URL + 'invoice',
            UPDATE_INVOICE: API_URL + 'invoice/update-status',
            INVOICE_USER: API_URL + 'invoice/user-invoice-info',
        },
        STATUS: {
            SUCCESS: '0_2_s',
            FAIL: '0_1_f',
        },
    },
    STATISTIC: {
        END_POINT: {
            STATISITC: API_URL + 'statistic',
        },
    },
    CART: {
        END_POINT: {
            CART: API_URL + 'cart',
            ADD_TO_CART: API_URL + 'cart/update-cart-item',
            SELECT_CART_ITEM: API_URL + 'cart/select-cart-item',
            ADD_TO_CART_UNAUTH:
                API_URL + 'cart/un-authenticate/update-cart-item',
            GET_UNAUTH_CART: API_URL + 'cart/un-authenticate',
        },
        STATUS: {
            GET_PRODUCT_SUCCESS: '0_2_s',
        },
    },
    USER: {
        END_POINT: {
            ADDRESS: API_URL + 'user/address',
            INFO: API_URL + 'user/current-user',
            UPDATE: API_URL + 'user',
        },
    },
    // PAYMENT: {
    //     END_POINT: {
    //         CHECK_OUT: API_URL + 'payment/user-cart-checkout',
    //         SINGLE_CHECKOUT: API_URL + 'payment/single-item-checkout',
    //         UNTAUTH_CHECK_OUT:
    //             API_URL + 'payment/un-authenticate/user-cart-checkout',
    //         UNTAUTH_SINGLE_CHECKOUT:
    //             API_URL + 'payment/un-authenticate/single-item-checkout',
    //     },
    // },
    SEARCH: {
        ENDPOINT: API_URL + 'search/global',
    },
};

export const ATTRIBUTED = {
    SIZE: {
        id: 'SIZE',
        name: 'Size',
    },
    COLOR: {
        id: 'COLOR',
        name: 'Color',
    },
};
