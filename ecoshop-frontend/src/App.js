import './App.css';
import { Button } from '@mui/material'
import { Fragment, useState } from 'react';
import BulkListing from './Components/BulkListing';
import Shorts from './Components/Shorts';



const App = () => {
  const [page, updatePage] = useState("home")

  return (
    <div style={{ margin: 10 }}>
      {page === "home" && (
        <Fragment>
          <Button variant="contained" style={{ marginRight: 5 }} onClick={() => { updatePage("bulk") }}>Bulk Listing</Button>
          <Button variant="contained" onClick={() => { updatePage("shorts") }}>EcoShop Shorts</Button>
        </Fragment>
      )}
      {page === "bulk" && (
        <BulkListing />
      )}
      {page === "shorts" && (
        <Shorts />
      )}
    </div>
  );
}

export default App;
