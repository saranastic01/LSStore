import axios from 'axios';
import { useEffect, useReducer} from "react"; //dodati useState ako zatreba
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from "../components/Product";
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
//import data from "../data";

const reducer = (state, action) => {
  switch(action.type){
    case 'FETCH_REQUEST':
      return{...state, loading:true};
    case 'FETCH_SUCCESS': 
      return{...state, products:action.payload, loading:false};
    case 'FETCH_FAIL':
      return{...state,loading:false, error:action.payload};
    default:
      return state;
  }
}

function HomeScreen() {
  const [{loading,error,products}, dispach] = useReducer(logger(reducer), {
    products:[],
    loading: true, 
    error:'',
  })
  //const[products, setProducts] = useState([]);
  useEffect(()=> {
    const fetchData = async () => {
      dispach({type: 'FETCH_REQUEST'});
      try{
        const result = await axios.get('/api/products');
        dispach({type:'FETCH_SUCCESS', payload:result.data})
      }catch(err ){
        dispach({type:'FETCH_FAIL', payload:err.message })
      }
      
      //setProducts(result.data);
    };
    fetchData();
  }, []); 
    return (
    <div>
      <Helmet>
        <title>LS Gaming</title>
      </Helmet>
        <h1>Featured Games</h1>
        <div className="products">
        {loading? ( 
        <LoadingBox/>
         ) : error ? ( 
         <MessageBox variant="danger">{error}</MessageBox>
         ) : (
          <Row>
        {products.map(product=>(
          <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
            <Product product={product}></Product>
          </Col>
          ))}
          </Row>
       )}
        </div>
    </div>
)}

export default HomeScreen