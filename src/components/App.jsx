import React from "react";
import Table from "./Table";
import Column from "./Column";
import Draggable from "react-draggable";
import data from "../data/easyTests";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zebraStyle: true,
      stickyHeader: false,
      pagination: false,
      rowDensity: "default",
      weight: [],
      sortable: [],
      filtrable: [],
      drag: { x: 0, y: 0 }
    };
  }

  onControlledDrag = (e, position) => {
    this.setState({ drag: position });
  };

  render() {
    const cols = [1, 2, 3];
    return (
      <div>
        <div id="settings" className="section">
          <p>
            <table>
              <tr>
                <td>StickyHeader</td>
                <td>
                  <input
                    type="checkbox"
                    checked={this.state.stickyHeader}
                    onChange={() =>
                      this.setState({ stickyHeader: !this.state.stickyHeader })
                    }
                  />
                </td>
                <td>RowDensity</td>
                <td>
                  <select
                    value={this.state.rowDensity}
                    onChange={evt =>
                      this.setState({ rowDensity: evt.target.value })
                    }
                  >
                    <option>default</option>
                    <option>compact</option>
                    <option>comfortable</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>ZebraStyle</td>
                <td>
                  <input
                    type="checkbox"
                    checked={this.state.zebraStyle}
                    onChange={() =>
                      this.setState({ zebraStyle: !this.state.zebraStyle })
                    }
                  />
                </td>
                <td />
                <td />
              </tr>
              <tr>
                <td>Pagination</td>
                <td>
                  <input
                    type="checkbox"
                    checked={this.state.pagination}
                    onChange={() =>
                      this.setState({ pagination: !this.state.pagination })
                    }
                  />
                </td>
                <td />
                <td />
              </tr>
            </table>

            <br />
            <table>
              <tr>
                <td />
                {cols.map(i => (
                  <th>Column {i}</th>
                ))}
              </tr>
              <tr>
                <th>weight</th>
                {cols.map(i => (
                  <th>
                    <input
                      style={{ width: "40px" }}
                      type="number"
                      value={this.state.weight[i] || 1}
                      onChange={evt => {
                        const weight = this.state.weight;
                        weight[i] = parseInt(evt.target.value, 10);
                        this.setState({ weight: weight });
                      }}
                    />
                  </th>
                ))}
              </tr>
              <tr>
                <th>sortable</th>
                {cols.map(i => (
                  <th>
                    <input
                      type="checkbox"
                      checked={this.state.sortable[i]}
                      onChange={evt => {
                        const sortable = this.state.sortable;
                        sortable[i] = !sortable[i];
                        this.setState({ sortable: sortable });
                      }}
                    />
                  </th>
                ))}
              </tr>
              <tr>
                <th>filterable</th>
                {cols.map(i => (
                  <th>
                    <input
                      type="checkbox"
                      checked={this.state.filtrable[i]}
                      onChange={evt => {
                        const filtrable = this.state.filtrable;
                        filtrable[i] = !filtrable[i];
                        this.setState({ filtrable: filtrable });
                      }}
                    />
                  </th>
                ))}
              </tr>
            </table>
          </p>
        </div>
        <br />
        <div id="container200" className="section">
          <Table
            data={data}
            stickyHeader={this.state.stickyHeader}
            zebraStyle={this.state.zebraStyle}
            afterRow={row => "My default after row: Name → " + row.nombre}
            globalFilter={this.state.globalFilter}
            pagination={this.state.pagination && { pageSize: 2 }}
            rowDensity={this.state.rowDensity}
            actions={[
              {
                text: "apellido",
                icon: "👁",
                visible: row => row.apellido,
                action: row => alert(row.apellido)
              },
              {
                text: "Default after row",
                visible: true,
                enabled: row => row.apellido,
                action: (row, utils) => utils.openAfterRow()
              },
              {
                text: "Dynamic after row",
                visible: true,
                enabled: row => row.apellido,
                action: (row, utils) =>
                  utils.openAfterRow(
                    <div>
                      Dynamic after row: Letra dni → {row.dni.letra}
                      <button onClick={utils.closeAfterRow}>x</button>
                    </div>
                  )
              }
            ]}
          >
            <Column
              name="Nombre"
              type="text"
              dataKey={row => row.alias || row.nombre}
              weight={this.state.weight[1] || 1}
              sortable={this.state.sortable[1]}
              filtrable={this.state.filtrable[1]}
            />

            <Column
              name="Apellido"
              type="text"
              dataKey="apellido"
              weight={this.state.weight[2] || 1}
              sortable={this.state.sortable[2]}
              filtrable={this.state.filtrable[2]}
              treatment={obj => <b>{obj && "*** " + obj + " ***"}</b>}
            />

            <Column
              name="Documento de identidad"
              type="text"
              dataKey="dni"
              sortable={this.state.sortable[3]}
              filtrable={this.state.filtrable[3]}
              filterFn={(obj, constraint) =>
                !constraint.checked || obj.letra === "A"
              }
              filterView={<input type="checkbox" />}
              sortFn={(a, b) =>
                b.letra === a.letra ? 0 : b.letra > a.letra ? 1 : -1
              }
              weight={this.state.weight[3] || 1}
              treatment={obj => <span>{obj.numero + obj.letra}</span>}
            />
          </Table>
        </div>
        <br />
        <p>Drag the bar</p>
        <div className="section">
          <span
            style={{
              display: "inline-block",
              border: "1px solid black",
              position: "relative"
            }}
          >
            Header 1
          </span>
          <Draggable axis="x" bounds="parent" onDrag={this.onControlledDrag}>
            <div
              style={{
                width: "min-content",
                display: "inline-block",
                position: "relative"
              }}
            >
              <b style={{ color: "red", cursor: "ew-resize" }}>|</b>
            </div>
          </Draggable>
          <span
            style={{
              display: "inline-block",
              border: "1px solid black",
              left: this.state.drag.x,
              position: "relative"
            }}
          >
            Header 2
          </span>
        </div>
      </div>
    );
  }
}

module.exports = App;
