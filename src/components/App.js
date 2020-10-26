import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Meme from '../abis/Meme.json'
import logo from '../logo.png';
import { Button, Navbar, FormControl, Form, Nav, Container, Row, Image, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ipfsClient = require('ipfs-http-client')
// connect to ipfs daemon API server
/* 
  Ex: run locally with your own node
  const ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' })
*/
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these value/s

 // const ipfs = ipfsClient({ host: '127.0.0.1', port: '5001', protocol: 'http'  })

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Meme.networks[networkId]
    if(networkData) {
      const contract = new web3.eth.Contract(Meme.abi, networkData && networkData.address)
      this.setState({ contract: contract })
      const memeHash = await contract.methods.get().call()
      if(memeHash !== null) {
        this.setState({ memeHash })
      }
      
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)

    this.state = {
      memeHash: '',
      contract: null,
      web3: null,
      buffer: null,
      account: null
    }
  }



  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  // Example Hash: "QmTrff21rjJCbLLkTEZiLMmsr8yAGW5USs8ZFG1UHSZAg4"
  // Example url: https://ipfs.infura.io/ipfs/QmTrff21rjJCbLLkTEZiLMmsr8yAGW5USs8ZFG1UHSZAg4

  onSubmit = (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    ipfs.add(this.state.buffer, async (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }
        // this.state.contract.methods.set(result[0].hash).send({ from: this.state.account });
        // console.log('Data', setData);
       this.setState({ memeHash: result[0].hash });
       this.state.contract.methods.set(result[0].hash).send({ from: this.state.account }).then((r) => {
        console.log('Ok', r)
       })
       window.alert("File Uploaded Successfully")
    })
  }

  downloadFile = async() => {
    console.log('Get')
    const fileData = await this.state.contract.methods.get().call()
    console.log('File Data', fileData)
    let files = await ipfs.get(this.state.memeHash)
    console.log(files)
    window.open(`https://ipfs.infura.io/ipfs/${fileData}`, '_blank')
  //   ipfs.files.get(this.state.memeHash, function (err, files) {
  //     files.forEach((file) => {
  //         console.log(file.path)
  //         console.log("File content >> ",file.content.toString('utf8'))
  //   })
  // })
  }
  render() {
    let hashValue = this.state.memeHash;
    let button;
    // let img = <img src={logo}  alt="img1"/>;
    let img = <Image className="img1" src={logo} roundedCircle />
    if (hashValue !== '') {
      img = <Image className="img1" src={`https://ipfs.infura.io/ipfs/${this.state.memeHash}`} alt="hashedImg" />;

      button = <div className="downloadBtn"><Button variant="danger" onClick={this.downloadFile}>Download</Button></div>
    } 
    return (
      <div className="mainClass">

      <Navbar className="nav1" variant="dark">
          <Navbar.Brand href="#home">Blockchain With IPFS</Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="#home">Home</Nav.Link>
          </Nav>
          <Form inline>
            <FormControl type="text" placeholder="Search" className="mr-sm-2" />
            <Button variant="outline-info">Search</Button>
          </Form>
        </Navbar>

        <p>&nbsp;</p>
        <h2>Upload Your Files</h2>

        <p>&nbsp;</p>
        <Container>
          <Row>
            <Col className="fileImg">
             {img}
            </Col>
          </Row>
        </Container>
        <p>&nbsp;</p>

        <form onSubmit={this.onSubmit} className="form1">
          <div>
            <label htmlFor="files"  className="btn">Select File</label>
            <input id="files"  type="file" onChange={this.captureFile} />
          </div>
          
          <input type='submit' className="submit" />
        </form>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        {button}

        

        {/* <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meme of the Day
          </a>
        </nav> */}

        {/* <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {img}
                </a>
                <p>&nbsp;</p>
                <p>&nbsp;</p>
                <h2>Change Meme</h2>
                <p>&nbsp;</p>
                <form onSubmit={this.onSubmit} >
                  <input type='file' onChange={this.captureFile} />
                  <input type='submit' />
                </form>
                {button}
              </div>
            </main>
          </div>
        </div>  */}
      </div>
    );
  }
}

export default App;
