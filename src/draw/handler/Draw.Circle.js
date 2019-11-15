/**
 * @class L.Draw.Circle
 * @aka Draw.Circle
 * @inherits L.Draw.SimpleShape
 */
L.Draw.Circle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'circle'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#3388ff',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		showRadius: true, //Whether to show the radius in the tooltip
		showArea: false, //Whether to show the area in the tooltip
		metric: true, // Whether to use the metric measurement system or imperial
		precision: {}, // How precise to round the area
		feet: true, // When not metric, use feet instead of yards for display
		nautic: false // When not metric, not feet use nautic mile for display
	},

	// @method initialize(): void
	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Circle.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.circle.tooltip.start;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function (latlng) {
		// Calculate the distance based on the version
		if (L.GeometryUtil.isVersion07x()) {
			var distance = this._startLatLng.distanceTo(latlng);
		} else {
			var distance = this._map.distance(this._startLatLng, latlng);
		}

		if (!this._shape) {
			this._shape = new L.Circle(this._startLatLng, distance, this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setRadius(distance);
		}
	},

	_fireCreatedEvent: function () {
		var circle = new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, circle);
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng,
			showRadius = this.options.showRadius,
			showArea = this.options.showArea,
			useMetric = this.options.metric,
			radius,
			area;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._drawShape(latlng);

			// Get the new radius (rounded to 1 dp)
			radius = this._shape.getRadius().toFixed(1);

			// Get the area of the circle
			area = Math.PI * (radius * radius);

			var subtext = [''];
			if (showRadius) {
				subtext.push(L.drawLocal.draw.handlers.circle.radius + ': ' +
					L.GeometryUtil.readableDistance(radius, useMetric, this.options.feet, this.options.nautic)
				);
			}
			if (showArea) {
				subtext.push(L.drawLocal.draw.handlers.circle.area + ': ' +
					L.GeometryUtil.readableArea(area, useMetric, this.options.precision)
				);
			}
			subtext = subtext.join(' ').trim();
			this._tooltip.updateContent({
				text: this._endLabelText,
				subtext: subtext
			});
		}
	}
});
