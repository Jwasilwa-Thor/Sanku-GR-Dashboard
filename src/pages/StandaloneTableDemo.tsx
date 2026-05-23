import React from 'react';

/**
 * StandaloneTableDemo Component
 * 
 * This component demonstrates a standalone HTML table that operates without
 * being nested within any container elements (<div>, <section>, etc.) inside
 * the component itself. 
 * 
 * Responsiveness is achieved by applying overflow-x: auto directly to the 
 * <table> element using display: block.
 */
const StandaloneTableDemo: React.FC = () => {
  return (
    <table 
      className="standalone-table"
      aria-label="Stakeholder Influence and Support Matrix"
      style={{
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
        display: 'block',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <caption style={{ padding: '1.5rem', fontWeight: 700, fontSize: '1.25rem', textAlign: 'left', color: '#0f172a' }}>
        Standalone Stakeholder Power Map
      </caption>
      <thead>
        <tr style={{ backgroundColor: '#f8fafc' }}>
          <th scope="col" style={headerStyle}>Influence \ Support</th>
          <th scope="col" style={headerStyle}>Strong Opponent</th>
          <th scope="col" style={headerStyle}>Opponent</th>
          <th scope="col" style={headerStyle}>Neutral</th>
          <th scope="col" style={headerStyle}>Supporter</th>
          <th scope="col" style={headerStyle}>Champion</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row" style={rowHeaderStyle}>Very High</th>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>Minister of Health</td>
          <td style={cellStyle}>CEO Sanku</td>
        </tr>
        <tr>
          <th scope="row" style={rowHeaderStyle}>High</th>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>Director of Nutrition</td>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>-</td>
        </tr>
        <tr>
          <th scope="row" style={rowHeaderStyle}>Medium</th>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>Local Governor</td>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>-</td>
        </tr>
        <tr>
          <th scope="row" style={rowHeaderStyle}>Low</th>
          <td style={cellStyle}>Community Leader</td>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>-</td>
          <td style={cellStyle}>-</td>
        </tr>
      </tbody>
      <tfoot style={{ backgroundColor: '#f8fafc' }}>
        <tr>
          <td colSpan={6} style={{ padding: '1rem', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #e2e8f0' }}>
            * This table is rendered as a standalone <code>&lt;table&gt;</code> element without any parent <code>&lt;div&gt;</code> wrappers.
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

const headerStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'center',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#475569',
  borderBottom: '1px solid #e2e8f0',
  borderRight: '1px solid #e2e8f0',
  minWidth: '150px'
};

const rowHeaderStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'center',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: '#475569',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0',
  borderRight: '1px solid #e2e8f0',
  minWidth: '120px'
};

const cellStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'center',
  fontSize: '0.875rem',
  color: '#1e293b',
  borderBottom: '1px solid #f1f5f9',
  borderRight: '1px solid #f1f5f9',
  minHeight: '80px',
  minWidth: '150px'
};

export default StandaloneTableDemo;
