import axios from 'axios';
import React, { useState } from 'react';
import '../../../styles/Dashboard/MarksheetGeneration.scss';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../../../context/User.context';
import Papa from "papaparse";
import JsonTable from './JsonTable';
import { Button } from 'react-bootstrap';
import JSZipUtils from 'jszip-utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const MarksheetGeneration = () => {
    const [state, setState] = useState({
        selectedFiles: null,
        loaded: 0,
        subName: '',
        _id: '',
    });

    const [marksheet, setMarksheet] = useState([]);

    const maxSelectFile = event => {
        let files = event.target.files;
        if (files.length > 1) {
            toast.error('Maximum 1 file is allowed');
            event.target.value = null;
            return false;
        } else {
            let err = '';
            for (let i = 0; i < files.length; i++) {
                if (files[i].size > 15242880000) {
                    // 1.5 GB
                    err += files[i].name + ', ';
                }
            }
            if (err !== '') {
                // error caught
                event.target.value = null;
                toast.error(err + ' is/are too large. Please select file size < 1.5Gb');
            }
        }
        return true;
    };

    const fileChangeHandler = event => {
        const files = event.target.files;
        if (maxSelectFile(event)) {
            setState({
                ...state,
                selectedFiles: files,
                loaded: 0,
            });
        }
    };

    const fileUploadHandler = e => {
        e.preventDefault();
        if (!state.selectedFiles) {
            alert('Please Upload the File');
            return;
        }

        const data = new FormData();
        for (let i = 0; i < state.selectedFiles.length; i++) {
            data.append('file', state.selectedFiles[i]);
        }


        Papa.parse(state.selectedFiles[0], {
                complete: function (results) {
                    setMarksheet(results.data)
                }
            }
        )

        console.log(marksheet,"Shivasnh")
    };

    const handleClick = () => {
        toast.success('Details Updated');
    }

    const handleDownload = async() => {
        console.log(marksheet)
        var zip = new JSZip();
        var count = 0;
        var zipFilename = 'marksheets.zip';
        await axios
        .post('/teacher/createMarksheet',marksheet)
        .then(response => {
            toast.success(response.data.message)
            let urls = response.data.urls
            console.log(urls)
            urls.forEach(function (url) {
              var filename = url.roll + ".pdf";
              // loading a file and add it in a zip file
              JSZipUtils.getBinaryContent(url.url, async function (err, data) {
                if (err) {
                  throw err; // or handle the error
                }
                zip.file(filename, data, { binary: true });
                count++;
                if (count == urls.length) {
                    console.log("Executed")
                  var zipFile = await zip.generateAsync({ type: 'blob' });
                  saveAs(zipFile, zipFilename);
                }
              });
            });
        })
        .catch(err => {
          toast.error('Error occured', err);
          console.log(err);
        });
    }


    return (<div className="wrapper">
        <div className="uploadContainer">
            <ToastContainer />
            <h4>Marksheet Generation</h4>
            <hr />
            <div id="uploadForm">
                <div className="inputDiv">
                    <input
                        type="file"
                        name="file"
                        multiple="multiple"
                        accept=".csv"
                        onChange={e => fileChangeHandler(e)}
                    />
                </div>

                <div className="uploadBottom">
                    <button
                        type="button"
                        // className="btn btn-success btn-block"
                        onClick={e => fileUploadHandler(e)}
                    >
                        Get Table
                    </button>
                </div>
            </div>
            {JsonTable((marksheet))}
            <Button variant="outline-primary" onClick={handleClick}>Save All</Button>{' '}
            <Button variant="outline-primary" onClick={handleDownload}>Download All</Button>{' '}
        </div>
    </div>);
};

export default MarksheetGeneration;