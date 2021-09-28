import React from 'react';
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import Table from 'react-bootstrap/Table';
import {ProgressBar} from 'react-bootstrap';

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
            isCalculating: true,
            barChartIsReady: false,
            chartsHtml: '',
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
        this.showBarCharts = this.showBarCharts.bind(this);
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
        const { vehicles, people, planets } = this.state;
        let maxPopul = 0;
        let winner = [];
        return new Promise((resolve, reject) => {
            for(const v_key in vehicles) {
                let homeworlds = []; let populations = []; let pilotsByVeh = []; let planetsByVehicle = [];
                let plPopulTotalByVeh = 0; let popByPilotPl = 0;
                if(vehicles[v_key].pilots.length !== 0) {
                    for(const p_key in vehicles[v_key].pilots){
                        let pilot = people.find(p => p.url === vehicles[v_key].pilots[p_key]);

                        let planet = planets.find(p => p.url === pilot.homeworld);
                        popByPilotPl = !isNaN(parseInt(planet.population)) ? parseInt(planet.population) : 0;
                        pilotsByVeh.push(pilot.name);
                        //Check planet has already been and add population if hasn't
                        if(homeworlds.find(hw => hw === pilot.homeworld) === undefined){
                            homeworlds.push(pilot.homeworld);
                            populations.push(popByPilotPl)
                            planetsByVehicle.push(planet.name);
                            plPopulTotalByVeh += popByPilotPl;
                        }
                    }

                    if(plPopulTotalByVeh >= maxPopul){
                        maxPopul = plPopulTotalByVeh;
                        winner = {'vehicle': vehicles[v_key]['name'], 'pilots': pilotsByVeh,
                            'planets': planetsByVehicle, 'populations': populations, 'total': plPopulTotalByVeh
                        }
                        this.setState({winner})
                    }
                }
            }
            resolve();
            }
        );
    }

    showBarCharts() {
        let { planets } = this.state;
        let maxValue = 0;
        let maxWidth = 100; //percent
        let chartsHtml = [];
        for(const key in planets) {
            let population = !isNaN(parseInt(planets[key].population)) ? parseInt(planets[key].population) : 0;
            planets[key].population = !isNaN(parseInt(planets[key].population)) ? parseInt(planets[key].population) : 0;
            if(population >= maxValue) {
                maxValue = population;
            }
        }

        for(const key in planets) {
            chartsHtml.push(
                <tr>
                    <td>{planets[key].name} ({planets[key].population})</td>
                    <td style={{width: '100%'}}><ProgressBar now={planets[key].population * maxWidth/maxValue} /></td>
                </tr>
                )
        }
        this.setState({chartsHtml, barChartIsReady: true})

    }

    componentDidMount() {
        //Fetch API data
        this.getSwApi('people', this.state.swApis["people"], []);
        this.getSwApi('vehicles', this.state.swApis["vehicles"], []);
        this.getSwApi('planets', this.state.swApis["planets"], []);

        //Check periodically is data ready
        //Instead of Premise.all which one didn't succeed to use because of multiple pages of API data
        const interval = setInterval(() => {
            if(this.state.swApisStatus['people']
                && this.state.swApisStatus['vehicles']
                && this.state.swApisStatus['planets'])
            {
                clearInterval(interval);
                this.setState({ isLoaded: true, isCalculating: true })
                //Start Calculations
                this.findMostPopulatedByPilots()
                    .then(() => {
                        setTimeout(() => {
                            this.setState({isCalculating: false});
                        }, 3000)
                        }
                    )
                    .then(() => {
                        this.showBarCharts();
                    });
            }
        }, 200);


    }

    render() {
        const { error, isLoaded, swApisStatus, isCalculating, winner, chartsHtml, barChartIsReady} = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;;
        } else {
            return (
                <section >
                    {!isLoaded && (<div>Loading...</div>)}
                    {isLoaded && isCalculating && (<div>Calculating...<FontAwesomeIcon icon={faCog} spin/></div>)}
                    {isCalculating && (<div>
                        <p>People Loaded {this.state.people.length} {!swApisStatus['people'] &&
                        <FontAwesomeIcon icon={faCog} spin/>}</p>
                        <p>Vehicle loaded {this.state.vehicles.length} {!swApisStatus['vehicles'] &&
                        <FontAwesomeIcon icon={faCog} spin/>}</p>
                        <p>Planets loaded {this.state.planets.length} {!swApisStatus['planets'] &&
                        <FontAwesomeIcon icon={faCog} spin/>}</p>
                    </div>)
                    }
                    {isLoaded && !isCalculating && (

                        <Table striped bordered hover size="sm" responsive className='mb-3 bg-light' >
                            <tbody>
                                <tr>
                                    <td>Vehicle name with the largest sum</td>
                                    <td>{winner.vehicle}</td>
                                </tr>
                                <tr>
                                    <td>Related home planets and their respective
                                        population
                                    </td>
                                    <td>{winner.planets.toString()}({winner.populations.join(',')})</td>
                                </tr>
                                <tr>
                                    <td>Related pilot names</td><td>{winner.pilots.join(',')}</td>
                                </tr>
                            </tbody>
                        </Table>

                       )}
                    {barChartIsReady && <Table striped bordered hover responsive ><tbody>{chartsHtml}</tbody></Table>}
                </section>
            );
        }
    }
}

export default Main;
