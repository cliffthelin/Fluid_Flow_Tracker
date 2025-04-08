import React from 'react';

const AgeFlowRatePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-black py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-colors duration-300">
      <div className="w-full max-w-4xl">
        <h1>Urine Flow Rate by Age</h1>

        <div className="table-container">
          <h2>Male</h2>
          <table>
            <thead>
              <tr>
                <th>Age Group</th>
                <th>Average Qmax (mL/sec)</th>
                <th>Normal Range</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>18–30</td><td>21–25</td><td>15–30</td></tr>
              <tr><td>31–40</td><td>20–23</td><td>15–28</td></tr>
              <tr><td>41–50</td><td>18–21</td><td>12–25</td></tr>
              <tr><td>51–60</td><td>15–18</td><td>10–20</td></tr>
              <tr><td>61–70</td><td>12–15</td><td>8–18</td></tr>
              <tr><td>71+</td><td>10–13</td><td>7–15</td></tr>
            </tbody>
          </table>
        </div>

        <div className="table-container">
          <h2>Female</h2>
          <table>
            <thead>
              <tr>
                <th>Age Group</th>
                <th>Average Qmax (mL/sec)</th>
                <th>Normal Range</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>18–30</td><td>25–30</td><td>20–35</td></tr>
              <tr><td>31–40</td><td>22–28</td><td>18–32</td></tr>
              <tr><td>41–50</td><td>20–25</td><td>15–30</td></tr>
              <tr><td>51–60</td><td>18–23</td><td>12–28</td></tr>
              <tr><td>61–70</td><td>15–20</td><td>10–25</td></tr>
              <tr><td>71+</td><td>13–18</td><td>8–22</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgeFlowRatePage;
