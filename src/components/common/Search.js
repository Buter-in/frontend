import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { resolveName } from "../../utils/ens";
import { Web3Context } from "../../wrappers/web3";
import { defaultFromAddress, defaultToAddress } from "../../constants";
import { mainColor } from "../../constants";

export function Search() {
  const navigate = useNavigate();
  const { account, library } = useContext(Web3Context)
  const [searchFrom, setSearchFrom] = useState(defaultFromAddress);
  const [searchTo, setSearchTo] = useState(defaultToAddress);
  const [checked, setChecked] = useState(true);

  const handleChange = () => {
    setChecked(!checked);
  };

  useEffect(() => {
    if (account) {
      setSearchFrom(account)
    } else {
      setSearchFrom(defaultFromAddress)
    }
  }, [account])

  const search = async () => {
    var addressFrom = '';
    var addressTo = '';

    if (searchFrom.endsWith(".eth")) {
      addressFrom = await resolveName(searchFrom);
    } else {
      addressFrom = searchFrom;
    }

    if (searchTo.endsWith(".eth")) {
      addressTo = await resolveName(searchTo);
    } else {
      addressTo = searchTo;
    }
    console.log("addressFrom", addressFrom);
    console.log("addressTo", addressTo);


    navigate(`/${addressFrom.toLowerCase()}/${addressTo.toLowerCase()}/${checked ? 'exclude_contracts' : 'not_exclude_contracts'}`);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h1 className="text-center mb-2 text-xl" style={{ color: mainColor }}>You can find path from anyone to anyone</h1>
      <div className="flex flex-row m-2 items-center">
        <div className="mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </div>
        <div>
          If you want to find the way <i>from your wallet</i>, <br className="md:flex hidden"></br>then connect it or insert the address
        </div>
      </div>

      <div className="flex flex-col p-4 bg-white w-full mx-3 md:mx-0 md:w-[600px] rounded-2xl border border-black">


        <div className="flex items-center">
          <div className="mr-2 w-1/12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>

          </div>
          <div className="flex w-full self-start">
            <input value={searchFrom} onChange={(e) => { setSearchFrom(e.target.value) }} placeholder="[From] address / ENS" class="border-b-2 w-full border-gray-200 py-3 focus:outline-0"></input>
          </div>
        </div>

        <div className="flex items-center">
          <div className="mr-2 w-1/12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>


          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-2 w-1/12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>

          </div>
          <input value={searchTo} onChange={(e) => { setSearchTo(e.target.value) }} placeholder="[To] address / ENS" class="border-b-2 w-full border-gray-200 py-3 focus:outline-0"></input>
        </div>

        <div class="flex items-center pt-4 mb-4">
          <input id="default-checkbox" type="checkbox" checked={checked} onChange={handleChange} class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"></input>
          <label for="default-checkbox" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Exclude contracts</label>
        </div>

        <div className="flex items-center justify-center p-4">
          <div className="flex space-x-1 rounded-xl bg-blue-900/20 ml-1 text-lg justify-center">
            <button
              onClick={search}
              type="button"
              className="search-btn text-white px-4 text-md rounded-lg py-2.5 leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 bg-white shadow"
            >
              Search
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}