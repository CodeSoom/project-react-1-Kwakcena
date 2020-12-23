import { createSlice } from '@reduxjs/toolkit';

import {
  fetchProducts,
  fetchProduct,
  postProductFireStore,
  editProductFireStore,
  fetchUserProducts,
  deleteProductFireStore,
  deleteAllImageInStorage,
  uploadProductImages,
} from './services/api';

import { setIsLoading } from './commonSlice';

import { isEmpty } from './utils';

const initialProduct = {
  title: '',
  description: '',
  category: '',
  region: '',
  price: '',
  productImages: [],
  user: {},
  createAt: '',
};

const { actions, reducer: productReducer } = createSlice({
  name: 'productSlice',
  initialState: {
    product: initialProduct,
    products: [],
    userProducts: [],
  },
  reducers: {
    setProducts(state, { payload: products }) {
      return {
        ...state,
        products,
      };
    },
    setProduct(state, { payload: product }) {
      return {
        ...state,
        product,
      };
    },
    deleteProductImage(state, { payload: selectedImageUrl }) {
      return {
        ...state,
        product: {
          ...state.product,
          productImages: state.product.productImages
            .filter(({ imageUrl }) => imageUrl !== selectedImageUrl),
        },
      };
    },
    setInitialProduct(state) {
      return {
        ...state,
        product: initialProduct,
      };
    },
    setUserProducts(state, { payload: userProducts }) {
      return {
        ...state,
        userProducts,
      };
    },
  },
});

export const {
  setProducts,
  setProduct,
  setInitialProduct,
  deleteProductImage,
  setUserProducts,
  writeNewProduct,
  initialNewProduct,
} = actions;

export function loadInitProducts() {
  return async (dispatch) => {
    dispatch(setIsLoading(true));
    const products = await fetchProducts();
    dispatch(setProducts(products));
    dispatch(setIsLoading(false));
  };
}

export function loadProduct({ productId }) {
  return async (dispatch) => {
    const product = await fetchProduct(productId);
    dispatch(setProduct(product));
  };
}

export function loadUserProducts({ user }) {
  return async (dispatch) => {
    const userProducts = await fetchUserProducts({ user });
    dispatch(setUserProducts(userProducts));
  };
}

export function postProduct({ files, newProduct }) {
  return async (dispatch, getState) => {
    const {
      authReducer: {
        user,
      },
    } = getState();

    dispatch(setIsLoading(true));
    await postProductFireStore({
      ...newProduct,
      productImages: await uploadProductImages({ files }),
      user,
      createAt: Date.now(),
    });
    dispatch(setIsLoading(false));
  };
}

export function editProduct({
  files, toBeDeletedUrls, productId, newProduct,
}) {
  return async (dispatch, getState) => {
    const {
      productReducer: {
        product,
      },
    } = getState();

    const newProductImages = await uploadProductImages({ files });
    const editedProduct = {
      ...newProduct,
      productImages: [
        ...product.productImages,
        ...newProductImages,
      ],
      createAt: Date.now(),
    };

    dispatch(setIsLoading(true));
    await editProductFireStore({ productId, editedProduct });
    await deleteAllImageInStorage(toBeDeletedUrls);
    dispatch(setIsLoading(false));
  };
}

export function deleteProduct({ product }) {
  return async (dispatch, getState) => {
    const {
      productReducer: {
        userProducts,
      },
    } = getState();

    await deleteProductFireStore({ product });
    dispatch(setUserProducts(
      userProducts.filter(
        (myProduct) => myProduct.id !== product.id,
      ),
    ));
  };
}

export function deleteAllImageInDropzone() {
  return async (dispatch, getState) => {
    const {
      productReducer: {
        product: { productImages },
      },
    } = getState();

    if (isEmpty(productImages)) {
      return;
    }
    await deleteAllImageInStorage(productImages);
    dispatch(setInitialProduct());
  };
}

export default productReducer;
