import logo from '../../assets/my_buterin.png';

export function Icon() {
    return (
        <a href="/">
        <div className="App-logo self-start drop-shadow-lg">
            <img className="w-[70px]" src={logo}></img>
        </div>
        </a>
    )
}