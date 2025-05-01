import NavSub from './NavSub';

const MapMenu = () => {
  const mapOptins = ['live location', 'geo fence'];

  return (
    <div className="mt-12 overflow-x-auto px-5">
      <div className="flex items-center justify-between mb">
        {/* Navigation to display the different map options */}
        <NavSub options={mapOptins} />
      </div>
    </div>
  );
};

export default MapMenu;
