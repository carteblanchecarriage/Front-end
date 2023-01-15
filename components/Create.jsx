import Image from "next/image";
import React from "react";
import { useEffect, useState } from "react";
import { createPrompt } from "../utils/promptGen";
import { imageNFTSTORAGE, metadataNFTSTORAGE } from "../utils/web3utils";
import { CharacterBackstory } from "./CharacterBackstory";
import { CreateImageGrid } from "./CreateImageGrid";
import PDFParser from "./PDFParser";
import Placeholder from "../public/images/CREATE/placeholder.png";
import HelpToggle from "./HelpToggle";

export const Create = () => {
  const [pdfData, setPdfData] = useState(null); //url
  const [prompt, setPrompt] = useState(null); //url
  const [imageProcessing, setImageProcessing] = useState(false); //processing state ie. loading...
  const [error, setError] = useState(null); //error msg
  const [imageResult, setImageResult] = useState(null); //url
  const [selectedImage, setSelectedImage] = useState(null); //image chosen by user
  const [isMinting, setIsMinting] = useState(false); //minting nft state ie. loading...

  //states: no data, pdf uploaded, images generated, nft minted

  useEffect(() => {
    if (pdfData) {
      console.log("pdfData: ", pdfData);
      //create text prompt using pdfData and other data
      const prompt = createPrompt(pdfData);
      console.log("prompt: ", prompt);
      setPrompt(prompt);
      setError(null);
    }
  }, [pdfData]);

  const mintAvatar = async () => {
    setIsMinting(true);
    console.log("Minting avatar... with ", selectedImage);
    // connect to utils/web3utils.js and use the thing
    // pass the selected image  selectedImage to function

    const tx = await imageNFTSTORAGE(selectedImage);
    console.log("tx: ", tx);

    setIsMinting(false);
    //create standard metadata object
    const structuredMetadata = {
      name: "Wizard NFT!",
      description:
        "This is a wizard NFT, created during 'Operation Dragonborn' by our fearless heroes and the Scope Creeper! Just try to funge it. You can't do it.",
      image: `ipfs://${tx}`,
      external_url: "https://operation-dragonborn.vercel.app/",
      attributes: [
        {
          trait_type: "Class",
          value: "Wizard",
        },
        {
          trait_type: "Race",
          value: "Dragonborn!",
        },
        {
          trait_type: "Prompt",
          value: prompt,
        },
        {
          trait_type: "Level",
          value: 1,
          max_value: 20,
        },
        {
          trait_type: "Strength",
          value: pdfData.str[1],
        },
        {
          trait_type: "Dexterity",
          value: pdfData.dex[1],
        },
        {
          trait_type: "Constitution",
          value: pdfData.con[1],
        },
        {
          trait_type: "Intelligence",
          value: pdfData.int[1],
        },
        {
          trait_type: "Wisdom",
          value: pdfData.wis[1],
        },
        {
          trait_type: "Charisma",
          value: pdfData.cha[1],
        },
        {
          value: pdfData.playerName ? pdfData.playerName : pdfData.name,
        },
        {
          trait_type: "Background",
          value: pdfData.background,
        },
      ],
    };
    console.log(
      "structuredMetadata constructed successfully:  ",
      structuredMetadata
    );

    //upload metadata to ipfs
    const tokenuri = await metadataNFTSTORAGE(structuredMetadata);
    console.log("tokenuri: ", tokenuri);

    // const cid = uploadDataToIPFS(xx) //example from web3utils.js
    //mint nft
    // const tx = await mintNFT(cid)
    //check for error
    //isminting = false
  };

  const generateImages = async () => {
    console.log("Generating images... for ", prompt);
    setError(false);
    setImageProcessing(true);
    const fetchResult = await fetch("/api/getImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        data: prompt,
      }),
    }); //result is given as base64 encoded images
    const result = await fetchResult.json();
    console.log("result: ", result);

    setImageProcessing(false);
    if (result.error) {
      return setError(result.error);
    }
    setImageResult(result);
  };

  const handleGenderSelect = (e) => {
    console.log(e.target.value);
    setPdfData({ ...pdfData, gender: e.target.value });
  };

  return (
    <div>
      <div className="flex flex-wrap xl:flex-nowrap w-screen gap-2 justify-start items-start">
        {/* left column */}
        <div className="flex flex-col xl:w-2/5 w-full p-4 gap-4 justify-around">
          <div className="w-full h-full text-left flex flex-row space-between">
            <h2 id="create" className=" text-4xl">
              Create
            </h2>
            <HelpToggle />
          </div>
          <PDFParser
            setPdfData={setPdfData}
            pdfData={pdfData}
            setError={setError}
          />
          {pdfData && (
            <div>
              <select onChange={handleGenderSelect} name="" id="">
                <option value="">Select a gender (or dont)</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          )}
          <div className="bg-[#110402] text-left text-sm min-h-[150px] p-2">
            <h3>Character Stats:</h3>
            <p className="w-full break-words">{JSON.stringify(pdfData)}</p>
          </div>
          <div className="bg-[#110402] text-left text-sm min-h-[150px] p-2 h-full">
            <h3>Prompt:</h3>
            <textarea
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-full bg-transparent"
              value={prompt || ""}
            />
          </div>
        </div>

        {/* right column */}
        <div className="flex md:flex-nowrap flex-wrap xl:w-3/5 lg:w-full bg-[#110402] text-left h-full">
          {/* choosing column */}
          <div className="md:w-1/3 p-2">
            <div className="">
              <h2 className="text-2xl">Result Images</h2>
              <p>
                Press <span className=" italic">upload</span> to begin
                generating your avatar.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex flex-col justify-center items-center">
                <Image
                  className="w-1/2"
                  src={selectedImage || Placeholder}
                  alt=""
                  width={128}
                  height={128}
                />
                <p className="text-sm italic">Click to enlarge</p>
              </div>
              {isMinting ? (
                <p className="w-fit bg-[#D89A00] hover:bg-[#ab8933] py-1 px-6 rounded-full text-black cursor-not-allowed">
                  Minting...
                </p>
              ) : imageResult ? (
                <p
                  className="w-fit bg-[#D89A00] hover:bg-[#ab8933] py-1 px-6 rounded-full text-black cursor-pointer animate-pulse"
                  onClick={mintAvatar}
                >
                  Mint Avatar
                </p>
              ) : imageProcessing ? (
                <p className="w-fit bg-[#D89A00] hover:bg-[#ab8933] py-1 px-6 rounded-full text-black cursor-not-allowed">
                  images loading...
                </p>
              ) : pdfData ? (
                <p
                  className="w-fit bg-emerald-600 hover:bg-emerald-500 py-1 px-6 rounded-full text-black cursor-pointer animate-pulse"
                  onClick={generateImages}
                >
                  Generate Images
                </p>
              ) : (
                <p className="w-fit bg-[#D89A00] hover:bg-[#ab8933] py-1 px-6 rounded-full text-black cursor-not-allowed">
                  Upload first!
                </p>
              )}
            </div>
          </div>

          {/* images grid */}
          <div className="md:w-2/3 min-h-[660px]">
            {/* a grid of 9 images */}
            <CreateImageGrid
              imageResult={imageResult}
              imageProcessing={imageProcessing}
              error={error}
              pdfData={pdfData}
              setSelectedImage={setSelectedImage}
            />
          </div>
        </div>
      </div>
      {/* bottom box */}
      <div className="flex justify-center">
        <CharacterBackstory pdfData={pdfData} />
      </div>
    </div>
  );
};
