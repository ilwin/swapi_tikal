import React from 'react';
import axios from "axios";

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: false,
            isLoaded: false,
            people: [],
            vehicles: [],
            planets: [],
            regexHasId: "/\d+/",
            counter: 0,
            swApis: {
                people: 'https://swapi.dev/api/people',
                vehicles: 'https://swapi.dev/api/vehicles',
                planets:  'https://swapi.dev/api/planets'
            },

        };
        this.getSwApi = this.getSwApi.bind(this);
    }

    getSwApi(apiName, link, data) {
        return axios.get(link)
            .then(
                (res) => {
                    data = Array.isArray(res.data.results) ? data.concat(res.data.results) : data;
                    if(res.data.next !== null ){
                        this.getSwApi(apiName, res.data.next, data)
                    }
                    else {
                        this.setState({
                            [apiName]: data
                        }, ()=> {console.log("FINAL:", apiName,  this.state[apiName]);})
                    }
                },
                (error) => {
                    this.setState({
                        error
                    })
                }
            );
    }

    componentDidMount() {

        // let people = this.getSwApi('people', this.state.swApis["people"], []);
        // let vehicles = this.getSwApi('vehicles', this.state.swApis["vehicles"], []);
        // let planets = this.getSwApi('planets', this.state.swApis["planets"], []);
        console.log(axios.get('https://swapi.dev/api/planets').then((res) => {console.log(res); console.log("1")}));


        Promise.all([
            axios.get('https://swapi.dev/api/planets').then((res) => {console.log(res); console.log("1")}),
            axios.get('https://swapi.dev/api/planets'),
            axios.get('https://swapi.dev/api/planets')
        ])
            .then(axios.spread((people, vehicles,planets) => {
                console.log("spread");
                console.log(people, vehicles, planets);
                this.setState({
                    isLoaded: true
                })

                for (let vehicleId in vehicles) {
                    if(vehicles[vehicleId]["pilots"] !== undefined && vehicles[vehicleId]["pilots"].length !== 0) {
                        for(let pilotId in vehicles[vehicleId]["pilots"]){
                            let pilotLink = vehicles[vehicleId]["pilots"][pilotId];
                            let pIdArr = pilotLink.match(this.state.regexHasId);
                            // if(Array.isArray(pIdArr) && pIdArr[0] !== undefined){
                            //     let pilot = people.find(p)
                            // }


                            console.log("vehicleId:", vehicleId, "pilotLink", pilotLink);
                            }
                        }
                    }
                    // console.log(key);
                    // console.log(vehicles[key]["pilots"]);
            },

                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            ));
    }

    render() {
        const { error, isLoaded} = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <ul>
{/*                    {items.map(item => (
                        <li key={item.name}>
                            {item.name}
                        </li>
                    ))}*/}
                </ul>
            );
        }
    }
}

export default Main;