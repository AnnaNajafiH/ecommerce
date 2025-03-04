import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import { toast } from "react-toastify";

import { Store } from "../../Store";
import { useCreateOrderMutation } from "../../hooks/orderHooks";
import { ApiError } from "../../types/ApiError";
import { getError } from "../../utils/utils";
import LoadingBox from "../../component/loadingBox/LoadingBox";
import CheckoutSteps from "../../component/checkoutSteps/CheckoutSteps";



export default function PlaceHolderPage() {
    const navigate= useNavigate();

    const {state,dispatch}=useContext(Store);
    const {cart}=state;

    // Helper function to round numbers to 2 decimal places
    const round2= (num: number)=>Math.round(num*100 + Number.EPSILON)/100;  //123.2345=>123.23

    // Calculate prices
    cart.itemsPrice=round2(cart.cartItems.reduce((a,c)=>a+c.price*c.quantity,0));
    cart.shippingPrice=cart.itemsPrice>100?round2(0):round2(10);
    cart.taxPrice=round2(cart.itemsPrice*0.15);
    cart.totalPrice=cart.itemsPrice+cart.shippingPrice+cart.taxPrice;

    const {mutateAsync: createOrder, status} = useCreateOrderMutation();

    const placeOrderHandler= async ()=>{
        try {
            const data= await createOrder({
            orderItems: cart.cartItems,
            shippingAddress: cart.shippingAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice
        });
        dispatch({type: 'CART_CLEAR'});
        localStorage.removeItem('cartItems');
        navigate(`/order/${data.order._id}`); 
        } catch (error) {
            toast.error (getError(error as ApiError))
        }
    }





    return(
        <div>
            <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
        <Helmet>
            <title>Preview Order</title>
        </Helmet>
        <h1 className="my-3">Preview Order</h1>
        <Row>
            <Col md={8}>
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Shipping</Card.Title>
                    <Card.Text>
                        <strong>Name:</strong> {cart.shippingAddress.fullName} <br/>
                        <strong>Address:</strong> {cart.shippingAddress.address}, {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
                    </Card.Text>
                    <Link to="/signin/shipping">Edit</Link>
                </Card.Body>
            </Card>

          {/* Payment Method */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Payment</Card.Title>
                    <Card.Text>
                        <strong>Method:</strong> {cart.paymentMethod}
                    </Card.Text>
                    <Link to="/payment">Edit</Link>
                </Card.Body>
            </Card>

          {/* Cart Items */}
            <Card className="mb-3">
                <Card.Body>
                    <Card.Title>Items</Card.Title>
                    <ListGroup variant="flush">
                        {cart.cartItems.map(item=>(
                            <ListGroup.Item key={item._id}>
                                <Row className="align-item-center">
                                    <Col md={6}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="img-fluid"></img>{' '}
                                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                    </Col>
                                    <Col md={3}>
                                        <span>{item.quantity}</span> 
                                    </Col>
                                    <Col md={3}>
                                        <span>${item.price}</span>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                    <Link to="/cart">Edit</Link>
                </Card.Body>
            </Card>
            </Col>
                    
            {/* Order Summary */}
            <Col md={4}>
           <Card>
            <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <Row>
                            <Col>Item</Col>
                            <Col>${cart.itemsPrice.toFixed(2)}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Shipping</Col>
                            <Col>${cart.shippingPrice.toFixed(2)}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Tax</Col>
                            <Col>${cart.taxPrice.toFixed(2)}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <Row>
                            <Col>Total Price</Col>
                            <Col>${cart.totalPrice.toFixed(2)}</Col>
                        </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <div className="d-grid">
                            <button
                            type="button"
                            onClick={placeOrderHandler}
                            // status should be loading but i get error 
                            disabled={cart.cartItems.length === 0 || status === "pending"}> 
                                Place Order
                            </button>
                         {status === "pending" && <LoadingBox />}
                        </div>
                    </ListGroup.Item>
                </ListGroup>
            </Card.Body>
            </Card> 
            </Col>
        </Row>
        </div>
    )

    }





