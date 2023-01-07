import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';


const JsonTable = (data) => {
    const [editId, setEditId] = useState(0)

    
    const handleClick = (id) => {
        setEditId(id);
        if(id==null){
            toast.success('Details Updated');
        }
    }

    const handleDownload = async (val) => {
        console.log("Shivansh",val)
        let data = [val];
        toast.success("Generating PDF")
        await axios
        .post('/teacher/createMarksheet',data)
        .then(res => {
            window.open(res.data.urls[0].url)
            toast.success("Download Successful")
        })
        .catch(err => {
          toast.error('Error occured', err);
          console.log(err);
        });
    }

    return (
        <Table striped bordered hover>
            <thead>
                {
                    data.map((value, index) => {
                        if (index === 0)
                            return (<tr>{
                                value.map((v, i) => {
                                    return (<th key={i}>{
                                        v
                                    }</th>)
                                })
                            }
                                <th>Edit</th>
                                <th>Download</th>
                            </tr>)
                    })
                }
            </thead>
            <tbody>
                {
                    data.map((value, index) => {
                        if (!(index === 0))
                            return (
                                <tr key={index}>
                                    {
                                        value.map((v, i) => {
                                            return (
                                                <td key={i}>
                                                    {
                                                        index === editId ?
                                                            <Form.Control type="text" placeholder="Normal text" value={v} /> :
                                                            v
                                                    }
                                                </td>
                                            )
                                        })
                                    }
                                    <td><Button variant="primary" onClick={() => { if (!(index === editId)){ handleClick(index) }else handleClick(null)}}>{
                                        (index === editId) ? "Save" : "Edit"
                                    }</Button></td>
                                    <td><Button variant="secondary" onClick={() => handleDownload(value)}>Download</Button></td>
                                </tr>
                            )
                    })
                }
            </tbody>
        </Table>
    );
}

export default JsonTable;