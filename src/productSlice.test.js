import configureStore from 'redux-mock-store';
import { getDefaultMiddleware } from '@reduxjs/toolkit';

import productReducer, {
  loadInitProducts,
  loadProduct,
  postProduct,
  editProduct,
  setProduct,
  setInitialProduct,
  deleteProductImage,
  setProducts,
  setUserProducts,
  deleteProduct,
} from './productSlice';

import { setIsLoading } from './commonSlice';

import products from '../fixtures/products';
import userProducts from '../fixtures/userProducts';
import newProduct from '../fixtures/newProduct';
import productImages from '../fixtures/productImages';
import { logInUser } from '../fixtures/user';

const middlewares = [...getDefaultMiddleware()];
const mockStore = configureStore(middlewares);
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

jest.mock('./services/api');

describe('productReducer', () => {
  context('when previous state is undefined', () => {
    const initialState = {
      product: initialProduct,
      products: [],
      userProducts: [],
    };

    it('returns initialState', () => {
      const state = productReducer(undefined, { type: 'action' });

      expect(state).toEqual(initialState);
    });
  });

  describe('setProducts', () => {
    const initialState = {
      products: [],
    };

    it('changes products', () => {
      const state = productReducer(initialState, setProducts(products));

      expect(state.products).toEqual(products);
    });
  });

  describe('setProduct', () => {
    const initialState = {
      product: initialProduct,
    };

    const product = products[0];

    const state = productReducer(initialState, setProduct(product));

    expect(state.product.id).toBe(1);
    expect(state.product.title).toBe('크리넥스 KF-AD 소형 마스크 팝니다.');
  });

  describe('deleteProductImage', () => {
    const originProductImages = productImages;
    const initialState = {
      product: {
        productImages: originProductImages,
      },
    };

    const selectedImageUrl = 'testImageUrl1';
    const state = productReducer(initialState, deleteProductImage(selectedImageUrl));

    expect(state.product.productImages).toEqual([
      { name: 'test2', imageUrl: 'testImageUrl2' },
      { name: 'test3', imageUrl: 'testImageUrl3' },
    ]);
  });

  describe('setInitialProduct', () => {
    const initialState = {
      product: products[0],
    };

    const state = productReducer(initialState, setInitialProduct());

    expect(state.product).toEqual(initialProduct);
  });

  describe('setUserProducts', () => {
    const initialState = {
      userProducts: [],
    };

    const state = productReducer(
      initialState,
      setUserProducts(userProducts),
    );

    expect(state.userProducts).toEqual(userProducts);
  });
});

describe('actions', () => {
  let store;

  describe('loadInitProducts', () => {
    beforeEach(() => {
      store = mockStore({});
    });

    it('runs setProducts', async () => {
      await store.dispatch(loadInitProducts());

      const actions = store.getActions();

      expect(actions[0]).toEqual(setIsLoading(true));
      expect(actions[1]).toEqual(setProducts([]));
      expect(actions[2]).toEqual(setIsLoading(false));
    });
  });

  describe('loadProduct', () => {
    beforeEach(() => {
      store = mockStore({});
    });

    it('dispatchs setProduct', async () => {
      await store.dispatch(loadProduct({ productId: 1 }));

      const actions = store.getActions();

      expect(actions[0]).toEqual(setProduct({}));
    });
  });

  describe('postProduct', () => {
    beforeEach(() => {
      store = mockStore({
        authReducer: {
          user: logInUser,
        },
        productReducer: {
          product: { productImages },
        },
      });
    });

    it('dispatchs', async () => {
      const files = [];

      await store.dispatch(postProduct({ files, newProduct }));

      const actions = store.getActions();

      expect(actions[0]).toEqual(setIsLoading(true));
      expect(actions[1]).toEqual(setIsLoading(false));
    });
  });

  describe('editProduct', () => {
    beforeEach(() => {
      store = mockStore({
        productReducer: {
          product: products[0],
        },
      });
    });

    it('dispatchs', async () => {
      const files = ['newImage1', 'newImage2'];
      const toBeDeletedUrls = [];
      const productId = '1';

      await store.dispatch(editProduct({
        files, toBeDeletedUrls, productId, newProduct,
      }));

      const actions = store.getActions();

      expect(actions[0]).toEqual(setIsLoading(true));
      expect(actions[1]).toEqual(setIsLoading(false));
    });
  });

  describe('deleteProduct', () => {
    const productWillDeleted = userProducts[0];

    beforeEach(() => {
      store = mockStore({
        productReducer: {
          userProducts,
        },
      });
    });

    it('dispatch setUserProducts', async () => {
      await store.dispatch(deleteProduct({ product: productWillDeleted }));

      const actions = store.getActions();

      expect(actions[0]).toEqual(setUserProducts(
        userProducts.filter((product) => product.id !== productWillDeleted.id),
      ));
    });
  });
});
