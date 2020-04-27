import React from "react";
import Table from "./Table";
import Column from "./Column";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zebraStyle: true,
      stickyHeader: false,
      weight: [],
      sortable: [],
      filtrable: []
    };
  }

  render() {
    const cols = [1, 2, 3];
    return (
      <div>
        <div id="settings" className="section">
          <p>
            <label>{"StickyHeader: "}</label>
            <input
              type="checkbox"
              checked={this.state.stickyHeader}
              onChange={() =>
                this.setState({ stickyHeader: !this.state.stickyHeader })
              }
            />
            <br />
            <label>{"ZebraStyle: "}</label>
            <input
              type="checkbox"
              checked={this.state.zebraStyle}
              onChange={() =>
                this.setState({ zebraStyle: !this.state.zebraStyle })
              }
            />
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
                  <td>
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
                  </td>
                ))}
              </tr>
              <tr>
                <th>sortable</th>
                {cols.map(i => (
                  <td>
                    <input
                      type="checkbox"
                      checked={this.state.sortable[i]}
                      onChange={evt => {
                        const sortable = this.state.sortable;
                        sortable[i] = !sortable[i];
                        this.setState({ sortable: sortable });
                      }}
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <th>filterable</th>
                {cols.map(i => (
                  <td>
                    <input
                      type="checkbox"
                      checked={this.state.filtrable[i]}
                      onChange={evt => {
                        const filtrable = this.state.filtrable;
                        filtrable[i] = !filtrable[i];
                        this.setState({ filtrable: filtrable });
                      }}
                    />
                  </td>
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
                !constraint.checked || obj.letra === "A"}
              filterView={<input type="checkbox" />}
              sortFn={(a, b) =>
                b.letra === a.letra ? 0 : b.letra > a.letra ? 1 : -1
              }
              weight={this.state.weight[3] || 1}
              treatment={obj => <span>{obj.numero + obj.letra}</span>}
            />
          </Table>
        </div>
      </div>
    );
  }
}

const data = [
  {
    nombre: "David",
    apellido: "Piñeiro",
    dni: { numero: "123", letra: "A" }
  },
  {
    nombre: "Noelia",
    apellido: "Urrutia",
    dni: { numero: "456", letra: "B" }
  },
  {
    nombre: "Sergio",
    apellido: "López",
    dni: { numero: "789", letra: "C" },
    alias: "This is my Alias"
  },
  {
    nombre: "Pepe",
    apellido: "Castro",
    dni: { numero: "111", letra: "A" }
  },
  {
    nombre: "María",
    apellido: "Magdalena",
    dni: { numero: "000", letra: "B" }
  },
  {
    nombre: "Sinosuke",
    apellido: "Nohara",
    dni: { numero: "222", letra: "C" }
  },
  {
    nombre: "Batman",
    dni: { numero: "001", letra: "B" }
  },
  {
    nombre: "Spiderman",
    dni: { numero: "999", letra: "A" }
  }
];

module.exports = App;
