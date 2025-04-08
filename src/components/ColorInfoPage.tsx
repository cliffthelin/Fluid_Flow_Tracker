import React from 'react';

const ColorInfoPage = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-center text-purple-700">Urine Color Information</h2>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">1. Light Yellow to Amber (Pale Straw to Honey)</p>
            <p>Indications: Normal. Indicates proper hydration. Lighter shades = more hydrated.</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">2. Clear</p>
            <p>Very hydrated or overhydrated. Not usually dangerous, but can indicate you're drinking more water than needed.</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">3. Dark Yellow</p>
            <p>Mild dehydration. Time to drink more water.</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">4. Amber or Honey</p>
            <p>Dehydrated. Body needs more fluids soon.</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">5. Orange</p>
            <p>Possible causes:</p>
            <p>Dehydration</p>
            <p>Liver/bile duct issues</p>
            <p>Certain medications (e.g., rifampin, phenazopyridine)</p>
            <p>Carrots or beta-carotene in diet</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">6. Pink or Red</p>
            <p>Possible causes:</p>
            <p>Beets, blackberries, rhubarb</p>
            <p>Blood in urine (hematuria) — could be due to UTI, kidney stones, or more serious conditions</p>
            <p>Medications (e.g., rifampin)</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">7. Blue or Green</p>
            <p>Rare, but can result from:</p>
            <p>Dyes in food or medications</p>
            <p>Medications like amitriptyline or propofol</p>
            <p>Certain bacterial infections</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">8. Brown or Cola-Colored</p>
            <p>Possible causes:</p>
            <p>Severe dehydration</p>
            <p>Liver disease</p>
            <p>Rhabdomyolysis (muscle breakdown)</p>
            <p>Fava beans or aloe in diet</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">9. Cloudy or Murky</p>
            <p>Could indicate:</p>
            <p>UTI</p>
            <p>Kidney stones</p>
            <p>High phosphate/crystals</p>
            <p>Presence of pus or mucus</p>
          </div>
          <div className="flex flex-col space-y-2">
            <p className="font-semibold">10. Foamy or Bubbly</p>
            <p>Occasional foam is normal.</p>
            <p>Persistent foam could suggest: Excess protein in urine (possible kidney issues)</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ColorInfoPage;
