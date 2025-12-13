import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import monthlyReportData from "../data/monthlyReport.json";

interface StateData {
  state_name: string;
  month: string;
  total_hospitals_reporting: number;
  diseases: {
    [key: string]: number;
  };
  total_cases: number;
  blood_groups_affected: {
    [key: string]: number;
  };
}

const DiseaseOutbreakPredictionModule: React.FC = () => {
  const analysis = useMemo(() => {
    const states = monthlyReportData.states as StateData[];
    
    // Find state with most cases
    const stateWithMostCases = states.reduce((max, state) => 
      state.total_cases > max.total_cases ? state : max
    );
    
    // Calculate disease increases (comparing all diseases across states)
    const diseaseTotals: { [key: string]: number } = {};
    states.forEach(state => {
      Object.entries(state.diseases).forEach(([disease, count]) => {
        diseaseTotals[disease] = (diseaseTotals[disease] || 0) + count;
      });
    });
    
    // Sort diseases by total cases
    const sortedDiseases = Object.entries(diseaseTotals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate blood group impact
    const bloodGroupTotals: { [key: string]: number } = {};
    states.forEach(state => {
      Object.entries(state.blood_groups_affected).forEach(([group, count]) => {
        bloodGroupTotals[group] = (bloodGroupTotals[group] || 0) + count;
      });
    });
    
    // Sort blood groups by impact
    const sortedBloodGroups = Object.entries(bloodGroupTotals)
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count);
    
    // Prepare state-wise disease breakdown
    const statesWithDiseases = states.map(state => {
      // Find the top disease in this state
      const topDisease = Object.entries(state.diseases)
        .sort((a, b) => b[1] - a[1])[0];
      
      return {
        stateName: state.state_name,
        totalCases: state.total_cases,
        hospitalsReporting: state.total_hospitals_reporting,
        diseases: state.diseases,
        topDisease: topDisease ? { name: topDisease[0], count: topDisease[1] } : null,
        bloodGroupsAffected: state.blood_groups_affected
      };
    }).sort((a, b) => b.totalCases - a.totalCases);

    return {
      stateWithMostCases,
      sortedDiseases,
      sortedBloodGroups,
      totalStates: states.length,
      statesWithDiseases
    };
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="ai-module">
      <div className="ai-module__header">
        <h2>Disease Outbreak Prediction</h2>
        <p className="ai-module__subtitle">
          AI-powered analysis of disease patterns and blood group impact based on past month data
        </p>
      </div>

      <div className="ai-module__content">
        {/* State with Most Cases */}
        <div className="ai-module__section">
          <h3>State with Highest Case Count</h3>
          <div className="highlight-box">
            <div className="highlight-box__state">{analysis.stateWithMostCases.state_name}</div>
            <div className="highlight-box__cases">
              Total Cases: <strong>{analysis.stateWithMostCases.total_cases.toLocaleString()}</strong>
            </div>
            <div className="highlight-box__hospitals">
              Hospitals Reporting: {analysis.stateWithMostCases.total_hospitals_reporting}
            </div>
          </div>
        </div>

        {/* Disease Increase Chart */}
        <div className="ai-module__section">
          <h3>Disease Cases Distribution (Past Month)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analysis.sortedDiseases}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Number of Cases" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Group Impact Chart */}
        <div className="ai-module__section">
          <h3>Blood Groups Most Affected</h3>
          <div className="charts-container">
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysis.sortedBloodGroups}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="group" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#82ca9d" name="Cases Affected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analysis.sortedBloodGroups}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ group, percent }) => `${group}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="group"
                  >
                    {analysis.sortedBloodGroups.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Diseases Summary */}
        <div className="ai-module__section">
          <h3>Top 3 Diseases by Case Count</h3>
          <div className="disease-list">
            {analysis.sortedDiseases.slice(0, 3).map((disease, index) => (
              <div key={disease.name} className="disease-item">
                <span className="disease-rank">#{index + 1}</span>
                <span className="disease-name">{disease.name}</span>
                <span className="disease-count">{disease.count.toLocaleString()} cases</span>
              </div>
            ))}
          </div>
        </div>

        {/* All States Disease Breakdown */}
        <div className="ai-module__section">
          <h3>State-wise Disease Analysis</h3>
          <p className="section-description">
            Detailed breakdown of disease cases across all {analysis.totalStates} states
          </p>
          <div className="states-grid">
            {analysis.statesWithDiseases.map((state, index) => (
              <div key={state.stateName} className="state-card">
                <div className="state-card__header">
                  <h4 className="state-card__name">{state.stateName}</h4>
                  <div className="state-card__total">
                    {state.totalCases.toLocaleString()} total cases
                  </div>
                </div>
                <div className="state-card__info">
                  <div className="state-card__hospitals">
                    {state.hospitalsReporting} hospitals reporting
                  </div>
                  {state.topDisease && (
                    <div className="state-card__top-disease">
                      <span className="top-disease-label">Top Disease:</span>
                      <span className="top-disease-name">{state.topDisease.name}</span>
                      <span className="top-disease-count">({state.topDisease.count} cases)</span>
                    </div>
                  )}
                </div>
                <div className="state-card__diseases">
                  <div className="diseases-title">Disease Breakdown:</div>
                  <div className="diseases-list">
                    {Object.entries(state.diseases)
                      .sort((a, b) => b[1] - a[1])
                      .map(([disease, count]) => (
                        <div key={disease} className="disease-row">
                          <span className="disease-row__name">{disease}</span>
                          <span className="disease-row__count">{count.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="state-card__blood-groups">
                  <div className="blood-groups-title">Most Affected Blood Groups:</div>
                  <div className="blood-groups-list">
                    {Object.entries(state.bloodGroupsAffected)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3)
                      .map(([group, count]) => (
                        <span key={group} className="blood-group-tag">
                          {group}: {count}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseOutbreakPredictionModule;

