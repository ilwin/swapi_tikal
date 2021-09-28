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
            swApisStatus: {
                people: false,
                vehicles: false,
                planets:  false
            },
        };
        this.getSwApi = this.getSwApi.bind(this);
        this.findMostPopulatedByPilots = this.findMostPopulatedByPilots.bind(this);
    }

    getSwApi(apiName, link, data) {
        return axios.get(link)
            .then(
                (res) => {
                    data = Array.isArray(res.data.results) ? data.concat(res.data.results) : data;
                    if (res.data.next !== null) {
                        this.getSwApi(apiName, res.data.next, data)
                    } else {
                        this.setState({
                            [apiName]: data,
                            swApisStatus: { ...this.state.swApisStatus, [apiName] : true},
                        }, () => {
                            console.log(apiName, "data:", this.state[apiName]);
                        })
                    }
                },
                (error) => {
                    this.setState({
                        error
                    })
                }
            );
    }

    /*
    Find Which vehicle names have the highest sum of population for all its pilots’ home planets
     */
    findMostPopulatedByPilots() {
        return new Promise((resolve, reject) => {
            console.log("inside");
            setTimeout(() => { resolve()}, 10000);
            }
        );
    }

    componentDidMount() {
        this.getSwApi('people', this.state.swApis["people"], []);
        this.getSwApi('vehicles', this.state.swApis["vehicles"], []);
        this.getSwApi('planets', this.state.swApis["planets"], []);

        //Instead of Premise.all which one didn't succeed to use because of multiple pages of API data
        //Check periodically is data ready
        const interval = setInterval(() => {
            if(this.state.swApisStatus['people']
                && this.state.swApisStatus['vehicles']
                && this.state.swApisStatus['planets'])
            {
                clearInterval(interval);
                //Start Calculations
                this.findMostPopulatedByPilots()
                    .then(() => console.log("counter"));
            }
        }, 200);


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