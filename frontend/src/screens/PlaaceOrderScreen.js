import Axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react'
import CheckoutSteps from '../components/CheckoutSteps'
import { Helmet } from 'react-helmet-async'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import { Link, useNavigate } from 'react-router-dom'
import { Store } from '../Store'
import { getError } from '../utils';
import { toast } from 'react-toastify';
import LoadingBox from '../components/LoadingBox';

const reducer = (state, action) => {
    switch (action.type) {
      case 'CREATE_REQUEST':
        return { ...state, loading: true };
      case 'CREATE_SUCCESS':
        return { ...state, loading: false };
      case 'CREATE_FAIL':
        return { ...state, loading: false };
      default:
        return state;
    }
  };

export default function PlaaceOrderScreen() {
    const navigate = useNavigate();

    const [{loading}, dispatch] = useReducer(reducer,{
        loading: false,        
    })

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart, userInfo } = state;

    const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
    cart.itemsPrice = round2(
        cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
    );

    cart.totalPrice = cart.itemsPrice;

    const placeOrderHandler = async () => {
        try{
            dispatch({type: 'CREATE_REQUEST'})

            const { data } = await Axios.post(
        '/api/orders',
        {
          orderItems: cart.cartItems,
          billingAddress: cart.billingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/order/${data.order._id}`);
        }catch(err){
            dispatch({type: 'CREATE_FAIL'});
            toast.error(getError(err))
        }
    };

    useEffect(() =>{
        if (!cart.paymentMethod) {
            navigate('/payment')
        }
    } ,[cart, navigate])

  return <div>
    <CheckoutSteps step1 step2 step3 step4> </CheckoutSteps>
        <Helmet> 
        <title>Preview  Order</title>
    </Helmet>
    <h1 className="my-3">Preview Order</h1>
    <Row>
        <Col md={8}>
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Billing Address</Card.Title>
                    <Card.Text>
                        <strong>Name: </strong>{cart.billingAddress.fullName} <br />
                        <strong>Adress: </strong>{cart.billingAddress.address},
                        {cart.billingAddress.city}, {cart.billingAddress.postalCode},
                        {cart.billingAddress.country}
                        
                    </Card.Text>
                    <Link to="/billing">Edit</Link>
                </Card.Body>
            </Card>
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Payment</Card.Title>
                    <Card.Text>
                        <strong>Method:</strong> {cart.paymentMethod}
                    </Card.Text>
                    <Link to="/payment">Edit</Link>
                </Card.Body>
            </Card>
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Items</Card.Title>
                    <ListGroup variant="flush">
                        {cart.cartItems.map((item) => (
                            <ListGroup.Item key={item._id}>
                                <Row className="align-items-center">
                                    <Col md={6}>
                                        <img src={item.image} alt={item.name}
                                        className="img-fluid rounded img-thumbnail"
                                        ></img>{' '}
                                        <Link to={`/products/${item.slug}`}>{item.name}</Link>
                                    </Col>
                                    <Col md={3}><span>{item.quantity}</span></Col>
                                    <Col md={3}><span>${item.price}</span></Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    <Link to="/cart">Edit</Link>
                </Card.Body>
            </Card>
        </Col>
        <Col md={4}>
            <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <ListGroup variant="flush">
                <ListGroup.Item>
                    <Row>
                        <Col>Items</Col>
                        <Col>${cart.itemsPrice.toFixed(2)}</Col>
                    </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                    <Row>
                        <Col><strong>Order Total</strong></Col>
                        <Col><strong>${cart.totalPrice.toFixed(2)}</strong></Col>
                    </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                    <div className="d-grid">
                        <Button
                        type="button"
                        onClick={placeOrderHandler}
                        disabled={cart.cartItems.length === 0}
                        >
                            Place Order
                        </Button>
                    </div>
                    {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Col>
    </Row>
  </div>
}
