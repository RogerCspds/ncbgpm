
const vue = new Vue({
  el: '#app',
  data: {
    listaDatos: [],
    filtroRazonSocial: ''
  },
  created() {
    this.getLista()
  },
  methods: {
    recargar() {
      console.log("recargando");
      this.getLista()
    },
    getLista() {
      // ID de la hoja de cálculo
      const idSheets = '19C2psyBRVjtUJxbdJOuI2BHFlySBPx92JJoPPVqB6q4';
      // Nuestra API Key
      const apiKey = 'AIzaSyD55gZRebDjR2rEGf9op46ZMILN2KpEgqY';

      // Rango de la hoja de cálculo "Cuentas"
      const cuentasRange = 'Cuentas!A2:AZ100';
      // Rango de la hoja de cálculo "Clientes"
      const clientesRange = 'Empresas!A2:AZ100';

      // Consulta para obtener los datos de la hoja "Cuentas"
      const cuentasQuery = "https://content-sheets.googleapis.com/v4/spreadsheets/" + idSheets + "/values/" + cuentasRange + "?access_token=" + apiKey + "&key=" + apiKey;

      // Consulta para obtener los datos de la hoja "Clientes"
      const clientesQuery = "https://content-sheets.googleapis.com/v4/spreadsheets/" + idSheets + "/values/" + clientesRange + "?access_token=" + apiKey + "&key=" + apiKey;

      // Realizamos las dos consultas en paralelo
      Promise.all([
        fetch(cuentasQuery).then(resp => resp.json()),
        fetch(clientesQuery).then(resp => resp.json())
      ]).then(responses => {
        const cuentas = responses[0].values;
        const clientes = responses[1].values;

        // Creamos un objeto vacío para almacenar los datos combinados
        const datos = {};

        // Recorremos las cuentas y agregamos los datos al objeto datos
        cuentas.forEach(cuenta => {
          const idCliente = cuenta[1];

          if (!datos[idCliente]) {
            // Si aún no existe el cliente en el objeto de datos, lo creamos
            datos[idCliente] = {
              ID_Cliente: idCliente,
              RUC: '',
              Razon_Social: '',
              Cuentas: [],
            };
          }
          datos[idCliente].Cuentas.push({
            Banco: cuenta[2],
            Cuenta: cuenta[3],
            Inter: cuenta[4]
          });
        });

        // Recorremos los clientes y agregamos los datos faltantes
        clientes.forEach(cliente => {
          const idCliente = cliente[0];

          if (datos[idCliente]) {
            datos[idCliente].RUC = cliente[2];
            datos[idCliente].Razon_Social = cliente[1];
          }
        });

        // Convertimos el objeto de datos a un array y lo asignamos a la propiedad listaDatos
        const listaDatos = [];
        for (const idCliente in datos) {
          const cliente = datos[idCliente];
          cliente.Cuentas.forEach(cuenta => {
            listaDatos.push({
              ID_Cliente: cliente.ID_Cliente,
              RUC: cliente.RUC,
              Razon_Social: cliente.Razon_Social,
              Banco: cuenta.Banco,
              Cuenta: cuenta.Cuenta,
              Inter: cuenta.Inter
            });
          });
        }
       // console.log(`Lista de datos: ${JSON.stringify(listaDatos)}`);          
        this.listaDatos = listaDatos;

      });
    },
    copiarValor(event, valor) {
      navigator.clipboard.writeText(valor);
      alert('El valor "' + valor + '" ha sido copiado al portapapeles');
    }  
  },
computed: {
  listaDatosFiltrada() {
    const filtro = this.filtroRazonSocial.trim().toLowerCase();
    if (!filtro) {
      return this.listaDatos;
    } else {
      return this.listaDatos.filter(cliente => {
        const razonSocial = cliente.Razon_Social.toLowerCase();
        return razonSocial.indexOf(filtro) !== -1;
      });
    }
  }
}

   
});
